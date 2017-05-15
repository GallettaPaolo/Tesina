var express = require('express');  
var passport = require('passport');  
var router = express.Router();
var mongoInstance = require('../models/MongoHelper')();
var Helper = require('../models/FileSystemHelper');
var fileSystemHelper = new Helper();
router.get('/', function(req, res, next) {  
  res.render('index', { title: 'Express' });
});

router.get('/main',(req,res) =>{
  res.render('main');
});

router.get('/register',(req,res)=>{
mongoInstance.getRoles((possibleRoles)=>{
    mongoInstance.getAthleteCategory((possibleCategories)=>{
      console.log(possibleCategories);
      res.render('registerForm', {
            roles: possibleRoles,
            categories: possibleCategories
          });
      })
  });
})

router.get('/login', function(req, res, next) {  
  res.render('login.ejs', { message: req.flash('loginMessage') });
});

router.get('/logout', function(req, res) {  
  req.logout();
  res.redirect('/');
});


router.get("/file",(req,res)=>{
  fileSystemHelper.createFolder("prova",()=>{
    console.log("hey");
  })
})

router.post('/signup', function(req, res, next) {
  passport.authenticate('local-signup', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      console.log("PORCO IL GESU CRISTO");
      console.log(JSON.stringify(req.user))
      console.log(fileSystemHelper);
      var image = new Buffer(req.body.imgUrl, "base64");
      console.log("Hey");
      fileSystemHelper.createFolder(req.user._id,(created)=>{
          if(created)
            fileSystemHelper.writeIntoFile(image,req.user._id,(written)=>{
              if(written) console.log("ok");
              else console.log("File non creato");
            })
            else console.log("Cartella non creata")
      })
     /* mongoInstance.updateUser({
        email: req.body.email, 
        password: req.body.password
      },{
        name: req.body.name,
        surname: req.body.surname,
        imgUrl: req.body.imgUrl,
        role: req.body.role,
        speciality: req.body.speciality
      },(success)=>{
          req.user.name = name;
          req.user.surname= surname;
          req.user.imgUrl = imgUrl;
          res.send(success);          
      } )*/
    });
  })(req, res, next);
});

router.post('/login', passport.authenticate('local-login', {  
  successRedirect: '/',
  failureRedirect: '/',
  failureFlash: true
}));

module.exports = router;

function isLoggedIn(req, res, next) {  
  if (req.isAuthenticated())
      return next();
  res.redirect('/');
}
