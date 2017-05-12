/**
 * Classe Per l'iterazione con il Database (Singleton)
 */
var singleton = null;
var Competition = require("./Competition.js");
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
     * Funzioni
     */
    function getDatabase(){
        return database;
    }

    this.getUrl = ()=>{
        return url;
    }

    /**
     * Funzione che ritorna tutte le competizioni 
     */
    this.getCompetitions = ()=>{
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("Connessione effettuata");
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
                competitions.push(new Competition(element.code,element.date,element.scale,element.description,element.type,element.location));
            }, this);
            console.log(competitions);
            callback();
        });
    }

};

/**
 * Funzione che viene esportata (Viene utilizzare per il pattern singleton)
 */
module.exports = function getHelper(){
    return (singleton == null)? new MongoHelper():singleton;
}