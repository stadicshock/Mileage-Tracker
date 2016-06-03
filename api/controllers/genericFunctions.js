var mango       = require("mongodb").MongoClient;
var config      = require("../../config").config;
var helperFn    = require("./helperFunctions");

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

exports.genericCRUD=function(action,collectionName,insertObj,queryParams,updateParams,callback) {
    mango.connect(config.db, function(err, db) {
        if(err) { 
            callback(false,"Unable to connect database server")
        }
        var collection = db.collection(collectionName);
        switch (action) {

            case "getAll":
                collection.find(JSON.parse(queryParams), function(err, item) {
                    if(err){
                        callback(false,"unable to get data");
                    }else{
                        item.toArray(callback);
                    }
                });
                break;

            case "getOne":
                collection.findOne(JSON.parse(queryParams), function(err, item) {
                    if(err){
                        callback(false,"unable to get data");
                    }else{
                        callback(null,item)
                    }
                });

            break;

            case "add":

                var collection = db.collection(collectionName);
                helperFn.generateId(collectionName, function (err, newId) {
                    var document=JSON.parse(insertObj);
                    document["_id"] = newId;
                    collection.insert(document, function (err, result) {
                        if (err) {
                            var errmsg = err.errmsg.toString();
                            callback(err,"failed");
                        } else {
                            if (result.result.ok) {
                                callback(null,"successfully added");
                            } else {
                                callback(null,"could not add");
                            }
                        }
                    });
                });
                break;

            case "update":
            var collection = db.collection(collectionName); 
            collection.update(JSON.parse(queryParams), {$set:JSON.parse(updateParams)}, function(err, result) {
                if (err){
                    callback(err,null)
                }else{
                    callback(null,"successfully updated")
                }
            });

            break;

            case "delete":
                var collection = db.collection(collectionName);
                collection.remove(JSON.parse(queryParams), function(err, result) {
                    if (err) {
                        callback(err,null);
                    }else{
                        callback(null,"Succesfully deleted")
                    }
                }); 
           }
    })
}