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
  mongoInstance.getAthleteSubscriptions(sess.user.email, (subscriptions) => {
    console.log("Gare prelevate dall'utente: " + JSON.stringify(subscriptions))
    mongoInstance.getCompetitionsWithinArray(subscriptions, (comp) => {
      console.log(comp)
      res.render('subscriptions', {
        subscriptions: subscriptions,
        competitions: comp
      });
    })
  })
})

router.get("/subscriptionRequests", (req, res) => {
  var sess = req.session;
  mongoInstance.getAthletesWithIds(sess.user.athletes, (aths) => {
    var totCompetitions = [];
    for (var i = 0; i < aths.length; i++) {
      for (var j = 0; j < aths[i].subscriptions.length; j++) {
        totCompetitions.push(aths[i].subscriptions[j]);
      }
    }
    console.log("Gare totali di tutti gli atleti: " + totCompetitions);
    mongoInstance.getCompetitionsWithinArray(totCompetitions, (comps) => {
      console.log("Gare prelevate: " + comps);
      res.render('subscriptionsRequests', {
        athletes: aths,
        competitions: comps
      })
    })

  })
})

router.get("/allAthletes", (req, res) => {
  mongoInstance.getUserWithoutTrainer((users) => {
    res.send(users);
    res.end();
  })
})

router.get("/getTrainerAthletes", (req, res) => {
  var sess = req.session;
  mongoInstance.getAthletesWithIds(sess.user.athletes, (aths) => {
    res.send(aths);
    res.end();
  })
})

router.get("/athleteGroup", (req, res) => {
  var sess = req.session;
  mongoInstance.getAthletesWithIds(sess.user.athletes, (aths) => {
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
    res.end();
  })

});

router.get('/main', (req, res) => {
  var sess = req.session;
  if (sess.user.role == undefined || sess.user.role == null)
    sess.user.isIncomplete = true;
  else
    sess.user.isIncomplete = false;
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

router.post("/setSeen",(req,res)=>{
  var session = req.session;
  mongoInstance.setProgramSeen(session.user.email,req.body.program,req.body.date,(set)=>{
    console.log(set);
    if(set){
      res.send(true);
      res.end();
    }
  })
})

router.get("/athleteTrainings",(req,res)=>{
  var sess = req.session;
  mongoInstance.getAthletesWithIds(sess.user.athletes,(athletes)=>{
    res.render("athletesTrainings",{
      athletes: athletes
    });
  })
})

router.get("/addTrain", (req, res) => {
  res.render("addTrain");
})

router.get("/listTrainings", (req, res) => {
  var sess = req.session;
  mongoInstance.getUserByEmail(sess.user.email, (user) => {
    res.render("listTrainings",{trainings: user.trainings});
  })
})

router.post("/storeProgram", (req, res) => {
  console.log(JSON.stringify(req.body.athletesEmail));
  var content = req.body.content.substring(req.body.content.indexOf(","), req.body.content.length)
  console.log("File name: " + req.body.name + "atleti: " + JSON.stringify(req.body.athletesEmail));
  fileSystemHelper.storeProgram(req.body.name, content, (stored) => {
    if (stored) {
      mongoInstance.pushProgram(req.body.athletesEmail.athletes, stored, (registered) => {

        res.send(true);
        res.end();

      })
    }
  })
})

router.post("/acceptAthlete", (req, res) => {
  var athlete = req.body.athlete;
  var competitions = req.body.competitions;
  var data = req.body.data;
  console.log(athlete);
  console.log(competitions);
  mongoInstance.subscribeMultipleCompetitions(athlete, competitions, data, (done) => {
    res.send(done);
    res.end();
  })
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
      res.end();
    }
  })
})

router.get('/getActions', (req, res) => {
  var role = req.query.role;
  mongoInstance.getActions(role, (acts) => {
    res.send(acts);
    res.end();
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
  var sess = req.session;
  mongoInstance.getCompetitions((comp) => {
    res.render('competitions', { competitions: comp, role: sess.user.role });
  })

})
router.post('/subscribe', (req, res) => {
  var sess = req.session;
  mongoInstance.subscribeAthlete(sess.user.email, req.body.compId, req.body.data, (subscribed) => {
    mongoInstance.getUserByEmail(sess.user.email, (user) => {
      sess.user = user;
      res.end();
    })
  })
})

router.post("/subscribeAthlete", (req, res) => {
  var athletes = req.body.athletes;
  var competition = req.body.competition;
  var data = req.body.data;
  console.log("Gara alla quale iscrivere un atleta: " + competition);
  mongoInstance.subscribeAthletes(athletes, competition, data, (subscribed) => {
    if (subscribed)
      res.send("True");
    res.end();
  })
})

router.post("/addAthletes", (req, res) => {
  var sess = req.session;
  var user = sess.user;
  mongoInstance.addAthletesToTrainer(req.body.athletes, user, (added) => {
    mongoInstance.getUserByEmail(user.email, (updatedUser) => {
      sess.user = updatedUser;
      mongoInstance.setAthletesTrainer(req.body.athletes, user, (set) => {
        if (set) {
          res.send(set);
          res.end();
        }
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
            res.end();
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
