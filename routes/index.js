var express = require('express');
var passport = require('passport');
var router = express.Router();
var mongoInstance = require('../models/MongoHelper')();
var Helper = require('../models/FileSystemHelper');
var fileSystemHelper = new Helper();
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});


router.get("/subscriptions", (req, res) => {
  var sess = req.session;
  mongoInstance.getCompetitionsWithinArray(sess.user.subscriptions, (comp) => {
    res.render('subscriptions', {
      subscriptions: sess.user.subscriptions,
      competitions: comp
    });
  })
})

router.get("/allAthletes", (req, res) => {
  mongoInstance.getUserWithoutTrainer((users) => {
    res.send(users);
  })
})

router.get("/athleteGroup", (req, res) => {
  var sess = req.session;
  mongoInstance.getAthletesWithIds(sess.user.athletes, (aths) => {
    console.log(aths);
    res.render('athleteGroup', {
      user: sess.user,
      athletes: aths
    });
  })
})


router.get('/autoLog', (req, res) => {
  var sess = req.session;
  var tmpUser = JSON.parse(req.query.curUser);
  mongoInstance.getUserByEmail(tmpUser.email, (user) => {
    sess.user = user;
    res.send('http://localhost:3000/main');
  })

});

router.get('/main', (req, res) => {
  var sess = req.session;
  console.log("Ruolo: " + sess.user.role);
  console.log(sess.user.role == undefined);
  if (sess.user.role == undefined || sess.user.role == null)
    sess.user.isIncomplete = true;
  else
    sess.user.isIncomplete = false;

  console.log(JSON.stringify(sess.user));
  mongoInstance.getActions((sess.user.isIncomplete) ? "Atleta" : sess.user.role, (acts) => {
    mongoInstance.getRoles((possibleRoles) => {
      mongoInstance.getAthleteCategory((possibleCategories) => {
        res.render('main', {
          user: sess.user,
          actions: acts,
          roles: possibleRoles,
          categories: possibleCategories
        });
      })
    })

  });
})


router.post('/addInfo', (req, res) => {
  var sess = req.session;
  var fields = req.body.fields;
  var values = req.body.values;
  var fieldsToAdd = {};
  for (var i = 0; i < fields.length; i++) {
    fieldsToAdd[fields[i]] = values[i];
  }

  mongoInstance.updateUser({ email: req.body.email }, fieldsToAdd, (updated) => {
    if (updated) {
      for (var i = 0; i < fields.length; i++) {
        sess.user[fields[i]] = values[i];
      }
      res.send(updated);
    }
  })
})

router.get('/getActions', (req, res) => {
  var role = req.query.role;
  mongoInstance.getActions(role, (acts) => {
    res.send(acts);
  })
})

router.get('/register', (req, res) => {
  mongoInstance.getRoles((possibleRoles) => {
    mongoInstance.getAthleteCategory((possibleCategories) => {
      res.render('registerForm', {
        roles: possibleRoles,
        categories: possibleCategories
      });
    })
  });
})

router.get("/competitions", (req, res) => {
  mongoInstance.getCompetitions((comp) => {
    res.render('competitions', { competitions: comp });
  })

})
router.post('/subscribe', (req, res) => {
  console.log("devo fare un iscrizione");
  var sess = req.session;
  mongoInstance.subscribeAthlete(sess.user.email, req.body.compId, req.body.data, (subscribed) => {
    mongoInstance.getUserByEmail(sess.user.email, (user) => {
      sess.user = user;
      res.end();
    })
  })
})

router.post("/addAthletes", (req, res) => {
  var sess = req.session;
  var user = sess.user;
  mongoInstance.addAthletesToTrainer(req.body.athletes, user, (added) => {
    mongoInstance.getUserByEmail(user.email, (updatedUser) => {
      sess.user = updatedUser;
      mongoInstance.setAthletesTrainer(req.body.athletes, user, (set) => {
        if (set)
          res.send(set);
      })
    })
  })
})

router.get('/logout', function (req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});



router.post('/signup', function (req, res, next) {
  passport.authenticate('local-signup', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }

      var data = req.body.imgUrl.replace(/^data:image\/\w+;base64,/, '');
      fileSystemHelper.storeProfileImg(req.user._id, "profileImg.jpg", data, (stored) => {
        mongoInstance.updateUser({
          email: req.body.email,
          password: req.body.password
        }, {
            name: req.body.name,
            surname: req.body.surname,
            imgUrl: stored,
            role: req.body.role,
            speciality: req.body.speciality
          }, (success) => {
            var sess = req.session;
            sess.user = {
              name: req.body.name,
              surname: req.body.surname,
              email: req.body.email,
              imgUrl: stored,
              role: req.body.role,
              speciality: req.body.speciality,
              subscriptions: []
            };
            res.send(success);
          })
      })

    });
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send('http://localhost:3000');
    }
    var sess = req.session;
    sess.user = user;
    res.send("http://localhost:3000/main")
  })(req, res, next);
})

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}
