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
    var database = true;
    
    /**
     * Funzioni
     */
     
    function setDatabase(db){
        console.log("Imposto il db"+ database);
        database = db;
        this.getCompetitions();
    }

    function getDatabase(){
        return database;
    }

    this.getUrl = ()=>{
        return url;
    }
    this.connect = ()=>{
        function callback (db){
            setDatabase(db);
        }
        MongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            callback(db);
        });
    };

    this.getCompetitions = ()=>{
        
        var competitions = getDatabase().collection("competitions");
        competitions.find({}).toArray((err,docs)=>{
            assert.equal(err, null);
            console.log("Found the following records");
            console.log(docs)
            callback(docs);
        })
    }
};

module.exports = function getHelper(){
    return (singleton == null)? new MongoHelper():singleton;
}