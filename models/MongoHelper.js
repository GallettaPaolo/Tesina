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
    var url = "mongodb://localhost:27017";
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

    this.getCompetitions = ()=>{
        MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var competitios = db.collection('competitions');
        console.log(competitions);
        db.close();
});
    }
};

module.exports = function getHelper(){
    return (singleton == null)? new MongoHelper():singleton;
}