var mango=require("mongodb").MongoClient;
var config=require("../../config").config;

exports.generateId=function(collectionName,callback) {
    
    mango.connect(config.db, function(err, db) {
        if(err){callback(err,null)}
        var collection = db.collection("collectionsConfig");
        var cdn = {"_id":collectionName}; 

        collection.findAndModify(cdn,[], {$inc:{record_intCount:1}}, {new:true},function(err,doc){            

            if(err){callback(err,null)}
            
            var charsLength=doc.value.record_strPrefix.length+(doc.value.record_intCount).toString().length
            var zeros="";
            for(var i=0;i<config.maxIdLength-charsLength;i++){
                zeros+="0";
            }
            newId=doc.value.record_strPrefix+zeros+doc.value.record_intCount;
            callback(null,newId);
        });               
    });
}