/**
 * Classe Per l'iterazione con il Database (Singleton)
 */
var singleton = null;

/**
 * Costruttore dell'helper
 */
function MongoHelper(){
    
    /**
     * Campi privati
     */
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/athletics";
    var assert = require("assert");
    var database;
 

    /**
     * Funzione che ritorna tutte le competizioni 
     */
    this.getCompetitions = ()=>{
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            findCompetitions(db,()=>{
                db.close();
            })
        });
    }

    var findCompetitions = (db,callback)=>{
        var competitionsColl = db.collection('competitions');
        var competitions = [];
        competitionsColl.find({}).toArray((err,coll)=>{
            coll.forEach(function(element) {
                competitions.push(element);
            }, this);
            callback();
        });
    }

    this.logUser = (user) =>{
        MongoClient.connect(url,(err,db) =>{
            assert.equal(null,err);
            findUser(db,user,(found)=>{
                db.close();
                if(!found)
                    return "Si è verificato un errore durante il login";
            });
        });
    }
    var findUser = (db, user, callback) =>{
        var usersColl = db.collection('users');
        function requestRegistration(){
            doRegistration(usersColl,user,(registered)=>{
                callback(registered);
            })
        }
        usersColl.find({email:user.email}).toArray((err,users) =>{
            if(users.length == 0)
                requestRegistration();
            else
                callback(true);
        })
    }

    var doRegistration = (userColl,user,callback) =>{
        userColl.insert(user,(err,result)=>{
            assert(null,err);
            console.log(result);        
        })
    }

    this.registerUser = (user)=>{
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            var userColl = db.collection('users');
            doRegistration(userColl,user,(registered)=>{
                db.close();
                if(!registered)
                    return "Si è verificato un errore durante la registrazione";
            })
        });
    }

};

/**
 * Funzione che viene esportata (Viene utilizzare per il pattern singleton)
 */
module.exports = function getHelper(){
    return (singleton == null)? new MongoHelper():singleton;
}