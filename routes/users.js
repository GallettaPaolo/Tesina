var express = require('express');
var router = express.Router();
var mongoInstance = require("../models/MongoHelper.js")();

/* GET users listing. */
router.post("/logUserIn", (req, res, next) => {
  var currentUser = JSON.parse(req.body.user);
  console.log("Devo autenticare:" + currentUser);
  mongoInstance.logUser(currentUser);
})

router.get('/register', (req, res, next) => {
  
})

router.post('/registerUser', function(req, res, next) {
  var currentUser = JSON.parse(req.body.user);
  mongoInstance.registerUser(currentUser, (response)=>{
    console.log(response);
  });
});

module.exports = router;
