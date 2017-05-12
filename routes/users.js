var express = require('express');
var router = express.Router();
var mongoInstance = require("../models/MongoHelper.js")();

/* GET users listing. */
router.post("/login",(req,res,next) =>{
  var currentUser = JSON.parse(req.body.user);
  console.log("Devo autenticare:"+currentUser.name);
  //mongoInstance.logUser(currentUser);
})

router.get('/register', function(req, res, next) {
    res.send("porcodio")
});

module.exports = router;