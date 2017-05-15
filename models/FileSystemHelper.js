function FileSystemHelper(){
    var fileSystem = require('fs');
    var path = require('path');
    var userSubFolder = '../users/';
    this.storeProfileImg = (id,name,data, callback)=>{
        fileSystem.exists(path.join(__dirname,userSubFolder+id),(exists)=>{
            if(!exists)
                fileSystem.mkdir(path.join(__dirname,userSubFolder+id),(err)=>{
                    if(err) console.log("Creazione cartella: "+err);
                })
             writeIntoFile(id,name,data,callback) 
        });
        
    }

    var writeIntoFile = (id,name,data,callback)=>{
        fileSystem.writeFile(path.join(__dirname,userSubFolder+id+'/'+name),data,{encoding: 'base64'},(err)=>{
            if(err) callback(err);
            else callback(true);
        });
    }


}

module.exports = FileSystemHelper