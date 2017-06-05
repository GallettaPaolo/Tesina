function FileSystemHelper() {
  var fileSystem = require('fs');
  var path = require('path');
  var userSubFolder = '../users/';
  var programsSubFolder = '../programs/';
  this.storeProfileImg = (id, name, data, callback) => {
    fileSystem.exists(path.join(__dirname, userSubFolder + id), (exists) => {
      if (!exists)
        fileSystem.mkdir(path.join(__dirname, userSubFolder + id), (err) => {
          if (err) console.log("Creazione cartella: " + err);
          console.log("Cartella creata")
          writeIntoFile(id, name, data, callback)
        })
    });

  }

  var writeIntoFile = (id, name, data, callback) => {
    fileSystem.writeFile(path.join(__dirname, userSubFolder + id + '/' + name), data, {
      encoding: 'base64'
    }, (err) => {
      console.log("Scrittura file: "+ err);
      if (err) callback(err);
      else callback(path.join("/"+id + '/' + name));
    });
  }

  this.storeProgram = (name,data,callback)=>{
    var buffer = new Buffer(data, 'base64');
    fileSystem.writeFile(path.join(__dirname,programsSubFolder+name),data.toString(),{encoding: 'base64'},
  (err)=>{
      console.log(err);
      if(err) callback(err);
      else callback(path.join("/"+ name))
    })
  }


}

module.exports = FileSystemHelper
