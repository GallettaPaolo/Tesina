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

router.get('/autoLog', (req, res) => {
  var sess = req.session;
  sess.user = JSON.parse(req.query.curUser);
  res.send('http://localhost:3000/main');
});

router.get('/main', (req, res) => {
  var sess = req.session;
  console.log("Ma porco dio");
  console.log(sess.user.role);
  console.log(sess.user.role == undefined);
  if (sess.user.role == undefined)
    sess.user.isIncomplete = true;
  else
    sess.user.isIncomplete = false;

  console.log(JSON.stringify(sess.user));
  mongoInstance.getActions("Atleta", (acts) => {
    mongoInstance.getCompetitions((comp) => {
      mongoInstance.getRoles((possibleRoles) => {
        mongoInstance.getAthleteCategory((possibleCategories) => {
          res.render('main', {
            user: sess.user,
            competitions: comp,
            actions: acts,
            roles: possibleRoles,
            categories: possibleCategories
          });
        })
      })
    })
  });
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
