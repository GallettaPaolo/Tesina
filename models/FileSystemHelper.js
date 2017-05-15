function FileSystemHelper(){
    var fileSystem = require('fs');
    var path = require('path');
    var userSubFolder = '../users/';
    this.createFolder = (id, callback)=>{
        fileSystem.exists(path.join(__dirname,userSubFolder+id),(exists)=>{
            if(!exists)
                fileSystem.mkdir(path.join(__dirname,userSubFolder+id),(err)=>{
                    if(err) console.log(err);
                    else    console.log("Dio negro");
                })
        });
        
    }

    this.writeIntoFile = (data,id,callback)=>{
        fileSystem.writeFile(path+id,data,(err)=>{
            if(err) callback(false)
            else    callback(true);
        })
    }


}

module.exports = FileSystemHelper;