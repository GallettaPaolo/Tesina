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
    console.log(athleteRole);
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
            subscribe(usrEmail, compId, userColl, (subscribed) => {
              db.close();
              callback(subscribed);
            })
          })
        else {
          subscribe(usrEmail, compId, userColl, (subscribed) => {
            db.close();
            callback(subscribed);
          })
        }
      })

    })
  }

  var subscribe = (usrEmail, compId, userColl, callback) => {
    userColl.updateOne({email:usrEmail},{$push:{subscriptions: compId}},()=>{
      assert.equal(null, err);
      assert.equal(1, r.result.n);
      socketCallback("subscription",null);
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
        console.log("Scalabilita " + scales);
        competitions.forEach((elem) => {
          var index = scales.findIndex((item, i) => {
            return item.key == elem.scale
          })
          console.log(scales[index])
          if (scales[index] == undefined)
            console.log(elem);
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
      console.log("roles: " + err);
      assert.equal(null, err);
      var roleColl = db.collection('role');
      var roles = findRoles(roleColl, (rol) => {
        db.close();
        console.log("Dentro il callback" + rol);
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
      console.log("category: " + err);
      assert.equal(null, err);
      var catColl = db.collection("athleteCategory");
      findCategories(catColl, (result) => {
        db.close();
        console.log("Callback" + result);
        callback(result);
      })
    })
  }

  var findCategories = (catColl, callback) => {
    catColl.find({}, {
      categoryName: 1,
      _id: 0
    }).toArray((err, categories) => {
      console.log("find: " + categories);
      callback(categories);
    })
  }

};

/**
 * Funzione che viene esportata (Viene utilizzare per il pattern singleton)
 */
module.exports = function getHelper() {
  return (singleton == null) ? new MongoHelper() : singleton;
}
