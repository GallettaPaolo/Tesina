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
  var ObjectID = require('mongodb').ObjectID;
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

  this.getUserWithoutTrainer = (callback) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      findUserWithoutTrainer(db, (users) => {
        db.close();
        callback(users);
      })
    })
  }

  var findUserWithoutTrainer = (db, callback) => {
    var userColl = db.collection('users');
    userColl.find({ $and: [{ role: "Atleta" }, { $or: [{ allenatore: undefined }, { allenatore: null }] }] }).toArray((err, arr) => {
      callback(arr);
    })
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

  this.subscribeAthlete = (usrEmail, compId, data, callback) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      var userColl = db.collection('users');
      userColl.find({ email: usrEmail }).toArray((err, arr) => {
        if (arr[0].subscriptions == undefined || arr[0].subscriptions == null)
          updatingUser(userColl, db, { email: usrEmail }, { subscriptions: [] }, (updated) => {
            subscribe(usrEmail, compId, data, userColl, 0, (subscribed) => {
              db.close();
              callback(subscribed);
            })
          })
        else {
          if (arr[0].subscriptions.indexOf(compId) == -1)
            subscribe(usrEmail, compId, data, userColl, arr[0].subscriptions.length, (subscribed) => {
              db.close();
              callback(subscribed);
            })
          else {

            db.close();
            callback(true);
          }
        }
      })

    })
  }

  var subscribe = (usrEmail, compId, data, userColl, subLen, callback) => {
    userColl.updateOne({ email: usrEmail }, { $push: { subscriptions: { competition: compId, dateRequest: data } } }, (err, r) => {
      assert.equal(null, err);
      assert.equal(1, r.result.n);
      console.log(socketCallback);
      socketCallback("subscription", { tot: subLen + 1 });
      callback(true);
    })

  }

  this.addAthletesToTrainer = (idsAthlete, user, callback) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      if (user.athletes == undefined || user.athletes == null) {
        updatingUser(db.collection('users'), db, { email: user.email }, { athletes: [] }, (updated) => {
          addAthletesIntoTrainer(idsAthlete, user, db, (added) => {
            db.close();
            callback(added);
          })
        })
      } else {
        addAthletesIntoTrainer(idsAthlete, user, db, (added) => {
          db.close();
          callback(added);
        })
      }
    })
  }

  var addAthletesIntoTrainer = (idsAthletes, user, db, callback) => {
    var userColl = db.collection('users');
    userColl.update({ email: user.email }, { $push: { athletes: { $each: idsAthletes } } }, (err, r) => {
      console.log("Errore: " + err);
      console.log("Risultato: " + r)
      assert.equal(err, null);
      assert.equal(1, r.result.n);
      callback(true);
    });
  }

  this.setAthletesTrainer = (idsAthletes, user, callback) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      setTrainer(idsAthletes, user, db, (set) => {
        db.close();
        callback(set);
      })
    })
  }

  var setTrainer = (idsAthletes, user, db, callback) => {
    var userColl = db.collection('users');
    var objectIds = [];
    for (var i = 0; i < idsAthletes.length; i++)
      objectIds.push(new ObjectID(idsAthletes[i]));

    userColl.updateMany({ _id: { $in: objectIds } }, { $set: { trainer: user._id } }, (err, r) => {
      assert.equal(err, null);
      assert.equal(objectIds.length, r.result.n);
      getAthletesIdArray(idsAthletes,userColl,(athletes)=>{
        socketCallback("trainer-set",athletes)
        callback(true);
      })
 
    })
  }

  this.getAthletesWithIds = (athletesId,callback)=>{
    MongoClient.connect(url,(err,db)=>{
      assert.equal(null,err);
      var userColl = db.collection('users');
      getAthletesIdArray(athletesId,userColl, (athletes)=>{
        db.close();
        callback(athletes);
      })
    })
  }

  var getAthletesIdArray = (athletesId,userColl, callback)=>{
    var objectIds = [];
    for(var i = 0; i < athletesId.length; i++){
      objectIds.push(new ObjectID(athletesId[i]));
    }
    userColl.find({_id:{$in: objectIds}}).toArray((err,arr)=>{
      assert.equal(null,err);
      callback(arr);
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


  this.getCompetitionsWithinArray = (ids, callback) => {
    var objectIds = [];
    for (var i = 0; i < ids.length; i++) {
      objectIds.push(new ObjectID(ids[i].competition));
    }
    console.log(objectIds);
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      getCompFromArray(objectIds, db, (competitions) => {
        db.close();
        callback(competitions);
      })
    })
  }

  var getCompFromArray = (ids, db, callback) => {
    var compColl = db.collection('competitions');
    compColl.find({ _id: { $in: ids } }).toArray((err, arr) => {
      callback(arr);
    })
  }


  this.getUserByEmail = (email, callback) => {
    MongoClient.connect(url, (err, db) => {
      assert.equal(null, err);
      var userColl = db.collection('users');
      getUserFromEmail(email, userColl, (user) => {
        db.close();
        callback(user);
      })
    })
  }

  var getUserFromEmail = (email, userColl, callback) => {
    userColl.find({ email: email }).toArray((err, arr) => {
      assert.equal(null, err);
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
