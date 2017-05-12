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
            console.log(competitions);
            callback();
        });
    }

    this.logUser = (user) =>{
        MongoClient.connect(url,(err,db) =>{
            assert.equal(null,err);
            findUser(db,user,()=>{
                db.close();
            });
        });
    }
    var findUser = (db, user, callback) =>{
        var usersColl = db.collection('users');
        usersColl.find({email:user.email}).toArray((err,users) =>{
            console.log("Err: "+err);
            console.log("Users found"+users);
        })
    }


};

/**
 * Funzione che viene esportata (Viene utilizzare per il pattern singleton)
 */
module.exports = function getHelper(){
    return (singleton == null)? new MongoHelper():singleton;
}