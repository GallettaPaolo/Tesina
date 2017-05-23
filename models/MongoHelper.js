/**
 * Classe Per l'iterazione con il Database (Singleton)
 */
var singleton = null;

/**
 * Costruttore dell'helper
 */
function MongoHelper() {

  /**
   * Campi privati
   */
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/athletics";
  var assert = require("assert");
  var database;
  var socketCallback;

  /**
   * Funzione che ritorna tutte le competizioni
   */

  this.setCallback = (callback) => {
    socketCallback = callback;
  }

  this.updateUser = (filter, data, callback) => {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      var userColl = db.collection("users");
      updatingUser(userColl, db, filter, data, (updated) => {
        db.close();
        callback(updated);
      })
    });
  }

  var updatingUser = (userColl, db, filter, data, callback) => {
    userColl.updateOne({ email: filter.email }, { $set: data }, (err, r) => {
      assert.equal(err, null);
      assert.equal(1, r.result.n);
      callback(true);
    })
  }


  this.getActions = (athleteRole, callback) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      var NavBarActionColl = db.collection('NavbarActions');
      findActions(athleteRole, NavBarActionColl, (actions) => {
        db.close();
        callback(actions);
      })
    })
  }
  var findActions = (athleteRole, navbarColl, callback) => {
    navbarColl.find({ $or: [{ name: athleteRole }, { name: "all" }] }, { _id: 0, name: 0 }).toArray((err, acts) => {
      var totActions = [];
      acts.forEach((e) => {
        e.actions.forEach((es) => {
          totActions.push(es);
        })
      })
      callback(totActions);
    });
  }

  this.subscribeAthlete = (usrEmail, compId, callback) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      var userColl = db.collection('users');
      userColl.find({ email: usrEmail }).toArray((err, arr) => {
        if (arr[0].subscriptions == undefined || arr[0].subscriptions == null)
          updatingUser(userColl, db, { email: usrEmail }, { subscriptions: [] }, (updated) => {
            subscribe(usrEmail, compId, userColl,0, (subscribed) => {
              db.close();
              callback(subscribed);
            })
          })
        else {
          if(arr[0].subscriptions.indexOf(compId) == -1)
            subscribe(usrEmail, compId, userColl,arr[0].subscriptions.length, (subscribed) => {
              db.close();
              callback(subscribed);
            })
          else{
  
            db.close();
            callback(true);
          }
        }
      })

    })
  }

  var subscribe = (usrEmail, compId, userColl,subLen, callback) => {
    userColl.updateOne({email:usrEmail},{$push:{subscriptions: compId}},(err,r)=>{
      assert.equal(null, err);
      assert.equal(1, r.result.n);
      console.log(socketCallback);
      socketCallback("subscription",{tot: subLen+1});
      callback(true);
    })

  }

  this.getCompetitions = (callback) => {
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      findCompetitions(db, (competitions) => {
        db.close();
        callback(competitions);
      })
    });
  }

  var findCompetitions = (db, callback) => {
    var competitionsColl = db.collection('competitions');
    var competitions = [];
    var dat = new Date();
    var dateToQuery = dat.getDate() + "/" + dat.getMonth();

    competitionsColl.find({ date: { $gt: dateToQuery } }).toArray((err, coll) => {
      coll.forEach(function (element) {
        competitions.push(element);
      }, this);
      findScales(db, (scales) => {
        competitions.forEach((elem) => {
          var index = scales.findIndex((item, i) => {
            return item.key == elem.scale
          })

          if (scales[index] == undefined)
          elem.scale = scales[index].name;
        })
        callback(competitions);
      })
    });
  }

  this.getScales = (callback) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      findScales(db, (scales) => {
        db.close();
        callback(scales);
      })
    })
  }

  var findScales = (db, callback) => {
    var scalesColl = db.collection("scale");
    scalesColl.find({}).toArray((err, arr) => {
      callback(arr)
    })
  }


  this.getUserByEmail = (email,callback)=>{
    MongoClient.connect(url,(err,db)=>{
      assert.equal(null,err);
      var userColl = db.collection('users');
      getUserFromEmail(email,userColl,(user)=>{
        db.close();
        callback(user);
      })
    })
  }

  var getUserFromEmail = (email,userColl,callback)=>{
    userColl.find({email: email}).toArray((err,arr)=>{
      assert.equal(null,err);
      callback(arr[0]);
    })
  }

  this.logUser = (user) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      findUser(db, user, (found) => {
        db.close();
        if (!found)
          return "Si è verificato un errore durante il login";
      });
    });
  }
  var findUser = (db, user, callback) => {
    var usersColl = db.collection('users');

    function requestRegistration() {
      doRegistration(usersColl, user, (registered) => {
        callback(registered);
      })
    }
    usersColl.find({
      email: user.email
    }).toArray((err, users) => {
      if (users.length == 0)
        requestRegistration();
      else
        callback(true);
    })
  }

  var doRegistration = (userColl, user, callback) => {
    userColl.insert(user, (err, result) => {
      assert.equal(null, err);
      callback(true);
    })
  }

  this.registerUser = (user, callback) => {
    var success = true;
    MongoClient.connect(url, function (err, db) {
      assert.equal(null, err);
      var userColl = db.collection('users');
      doRegistration(userColl, user, (registered) => {
        db.close();
        if (!registered)
          success = "Error";
        callback(success);
      })
    });
  }
  this.getRoles = (callback) => {
    MongoClient.connect(url, (err, db) => {

      assert.equal(null, err);
      var roleColl = db.collection('role');
      var roles = findRoles(roleColl, (rol) => {
        db.close();
        callback(rol);
      });
    })
  }

  var findRoles = (roleColl, callback) => {
    roleColl.find({}, {
      name: 1,
      _id: 0
    }).toArray((err, arr) => {
      callback(arr)
    })

  }

  this.getAthleteCategory = (callback) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      var catColl = db.collection("athleteCategory");
      findCategories(catColl, (result) => {
        db.close();
        callback(result);
      })
    })
  }

  var findCategories = (catColl, callback) => {
    catColl.find({}, {
      categoryName: 1,
      _id: 0
    }).toArray((err, categories) => {
      callback(categories);
    })
  }

};

/**
 * Funzione che viene esportata (Viene utilizzare per il pattern singleton)
 */
module.exports = function getHelper() {
  if (singleton == null) 
    singleton = new MongoHelper();
  return singleton;
}
