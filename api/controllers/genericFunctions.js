var mango       = require("mongodb").MongoClient;
var config      = require("../../config").config;

var crypto = require('crypto'),
   algorithm = 'aes-256-ctr',
   password = '64g1K4';

exports.encrypt=function(text){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

exports.decrypt=function(text){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}

exports.alreadyExist=function(err,key) {
    if(err.errmsg.search(key)>-1){
        return true;
    }
}

exports.genericCRUD=function(callback,action,collectionName,queryParams,updateParams,insertObj) {
    switch (action) {
        case "getAll":
                mango.connect(config.db, function(err, db) {
                if(err) { 
                    callback(false,"Unable to connect database server")
                }
                var collection = db.collection(collectionName);
                collection.find(queryParams, function(err, item) {
                    if(err){
                        callback(false,"unable to get data");
                    }else{
                        callback(null,item)
                    }
                });
                })
            break;
            
        case "getOne":
                mango.connect(config.db, function(err, db) {
                if(err) { 
                    callback(false,"Unable to connect database server")
                }
                var collection = db.collection(collectionName);
                collection.findOne(queryParams, function(err, item) {
                    if(err){
                        callback(false,"unable to get data");
                    }else{
                        callback(null,item)
                    }
                });
                })
            break;
            
        case "add":
            mango.connect(config.db, function(err, db) {
            if(err) { 
                callback(false,"Unable to connect database server")
            }
            var collection = db.collection(collectionName);
            collection.findOne(queryParams, function(err, item) {
                if(err){
                    callback(false,"unable to get data");
                }else{
                    callback(null,item)
                }
            });
            })
        break;
            
        default:
            break;
    }
}