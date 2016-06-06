var mango       = require("mongodb").MongoClient;
var config      = require("../../config").config;
var helperFn    = require("./helperFunctions");
var genericFn   = require("./genericFunctions");
exports.signup = function (req, res) {
    //inputs name,emailid,phoneNo,password
    mango.connect(config.db, function (err, db) {
        if (err) { return console.dir(err); }
        var collection = db.collection('userDetails');
        helperFn.generateId("userDetails", function (err, newId) {
            var enryptedPassword = genericFn.encrypt(req.body.password);
            var userDetailsData = { "_id": newId, "user_strName": req.body.name, "user_strEmailid": req.body.emailId, "user_strPhoneNo": req.body.phoneNo, "user_strPassword": enryptedPassword };
            collection.insert(userDetailsData, { w: 1 }, function (err, result) {
                if (err) {
                    var errmsg = err.errmsg.toString();
                    if (genericFn.alreadyExist(err, "user_strEmailid")) {
                        res.json({ "status": "Not ok", "responseCode": "1002", "responseDesc": "Email ID already exists" })
                    } else if (genericFn.alreadyExist(err, "user_strPhoneNo")) {
                        res.json({ "status": "Not ok", "responseCode": "1003", "responseDesc": "Phone Number already exists" })
                    } else {
                        res.json({ "status": "Not ok", "responseCode": "1004", "responseDesc": err })
                    }
                } else {
                    if (result.result.ok) {
                        res.json({ "status": "ok", "responseCode": "1000", "responseDesc": "Success" });
                    } else {
                        res.json({ "status": "Not ok", "responseCode": "1001", "responseDesc": "fail" });
                    }
                }
            });
        });
    });
    //output ok/Not ok
}


exports.forgotpassword = function (req, res) {
    //inputs emailId
    mango.connect(config.db, function (err, db) {
        if (err) { return console.dir(err); }
        var collection = db.collection('userDetails');                                                                                                                                                                                                     
        var userQuery = {"user_strEmailid": req.body.emailId};
        console.log(userQuery);
        collection.findOne(userQuery, function (err, result) {
            if (err) {
                res.json({ "status": "Not ok", "responseCode": "2001", "responseDesc": "Email Id you entered is Invalid. Please try again." });
            } else {
                //email exists
                //send email
                res.json({ "status": "ok", "responseCode": "2000", "responseDesc": "Email sent." });
            }
        });
    });
    //output ok/NotOk --process the password in email
}
exports.usrLogin = function(req, res){
  sess = req.session;
  if(sess.email) {
  res.json("already logged in");
  }else{
    console.log("new session");
    var params = req.body;
    var usrPassword = genericFn.encrypt(params.password);
    mango.connect(config.db, function(err, db) {
      if(err) { 
      return console.dir(err);
      }
      var collection = db.collection('userDetails');
      collection.findOne({"user_strEmailid":params.email,"user_strPassword":usrPassword}, function(err, item) {
        if(err){
          res.json({ "status": "Ok", "responseCode": "5001", "responseDesc": "Error while logging in" });
        }
        else if(item==null){
          res.json({ "status": "Ok", "responseCode": "5002", "responseDesc": "invalid credentials" });
        } else{
          sess.email=params.email;
          sess.name=item.user_strName;
          sess.userId = item._id;
          res.json({ "status": "Ok", "responseCode": "5000", "responseDesc": "successfully logged in" });
        }

      });

    })
  }

}

exports.usrLogout = function(req,res){
    req.session.destroy(function(err) {
        if(err) {
            res.json({ "status": "Not Ok", "responseCode": "4001", "responseDesc": "Could not logout" });
        } else {
            res.json({ "status": "Ok", "responseCode": "4000", "responseDesc": "Logged out" });

        }
    });
}

exports.changePasswod = function(req,res){
    var params = req.body;
    var userName = req.session.email;

    mango.connect(config.db, function(err, db) {
        if(err) { 
            return console.dir(err); 
        }
        var collection = db.collection('userDetails');
        collection.update({"user_strEmailid":userName,"user_strPassword":params.password}, {$set:{"user_strPassword":params.newpassword}}, function(err, result) {
            if (err){
           
                res.json({ "status": "Not ok", "responseCode": "3001", "responseDesc": "Could not update the password" });
            }else{
                res.json({ "status": "Ok", "responseCode": "3000", "responseDesc": "Updated the password successfully" });

            }
        });
    });
}

exports.genericfunctions = function(req,res){
    var params = req.body;
    genericFn.genericCRUD(params.action,params.collectionName,params.insertObj,params.queryParams,params.updateParams, function(err,result){
       res.json({"result":result})
    });
}
exports.bindUserVehicleCRUD = function(req, res){
    // vehicle ID, user ID,vehicle name
    var params = req.body;
    var userId = req.session.userId;
    var userVehicleData;
    var vehicleObj = {"_id":params.vehicleId};
    genericFn.genericCRUD("getOne", "NotvehicleDetails", [], vehicleObj, [], function(err, item){
                    if(err){
                        res.json({"status": "Not ok", "responseCode": "6001", "responseDesc": err});
                    }
                    else{
                        switch(params.action) {
                            case "add":
                                    userVehicleData = {"user_strId": userId, "vehicle_strName": params.vehicle_strName, "vehicleDetails": item};
                                    genericFn.genericCRUD("add", "userVehicleDetails", userVehicleData, [], [], function(err, message){
                                        if(err){
                                            res.json({"status": "Not ok", "responseCode": "7001", "responseDesc": message});
                                        }
                                        else{
                                            res.json({"status": "Ok", "responseCode": "7000", "responseDesc": message});
                                        }
                                    });
                                break;

                            case "update":
                                    userVehicleData = {"vehicle_strName": params.vehicle_strName, "vehicleDetails": item};
                                    genericFn.genericCRUD("update", "userVehicleDetails", [], {"_id":params.uvId}, userVehicleData, function(err, message){
                                        if(err){
                                            res.json({"status": "Not ok", "responseCode": "8001", "responseDesc": err});
                                        }
                                        else{
                                            res.json({"status": "Ok", "responseCode": "8000", "responseDesc": message});
                                        }
                                    });
                                    break;

                            case "delete":
                                    var uvObj = {"_id":params.uvId};
                                    genericFn.genericCRUD("delete", "userVehicleDetails", [], uvObj, [], function(err, message){
                                        if(err){
                                            res.json({"status": "Not Ok", "responseCode": "9001", "responseDesc": err});
                                        }
                                        else{
                                            res.json({"status": "Ok", "responseCode": "9000", "responseDesc": message});
                                        }
                                    });
                                    break;
                        }
                    }
    });
}

exports.addRefilling = function(req,res){
    var params= req.body;
    sess = req.session;
    var vehicleUserID;
    if(!sess.email) {
        res.json("not logged in");
    }else{
        genericFn.genericCRUD("getOne","userVehicleDetails",[],{"_id":params.UVID},[],function(err,doc){
            if(err){
                res.json({"status":"Not ok","errDesc":err.errmsg.toString()})
            }else{
                console.log(doc);
                if(sess.userId == doc.user_strId){
                    var document = {"UV_strId":params.UVID,"refillDate":params.refillDate,"refillAmount":params.refillAmount,"refillQuantity":params.refillQuantity};
                    genericFn.genericCRUD("add","refillDetails",document,[],[],function(err,result){
                        res.json({"result":result})
                    })
                } else{
                        res.json({"status":"Not ok","errorDesc":"Not authorized to add vehicle data"})
                }
            }
        });

    }
}

exports.updateRefilling = function (req, res) {
   //updateParams refillDate,refillAmount,refillQuantity  ------ queryParams userID,UVID,
   
   var params = req.body;
   sess = req.session;
   if (!sess.email) {
       res.json("Not logged in");
   } else { 
       genericFn.genericCRUD("getOne", "userVehicleDetails", [], { "_id": params.UVID }, [], function (err, doc) {
           if (err) {
               res.json({ "status": "Not ok", "errDesc": err.errmsg.toString() })
           } else {
               if (sess.userId == doc.user_strId) {
                   var queryParams = {"_id":params.refillId};
                   var updateParams= {"refillDate":params.refillDate,"refillAmount":params.refillAmount,"refillQuantity":params.refillQuantity};
                    genericFn.genericCRUD("update", "refillDetails","", queryParams, updateParams, function () {
                       if (err) { res.json("unable to update") }
                       else {
                           res.json("Updated successfully");
                       }
                   });
               }else{
                   res.json("Not authorized");
               }             
           }
       });
   }
  
}

exports.deleteRefilling = function(req,res){
   //inputs UVID, document id
   
  var params = req.body;
   sess = req.session;
   if (!sess.email) {
       res.json("Not logged in");
   } else { 
       genericFn.genericCRUD("getOne", "userVehicleDetails", [], { "_id": params.UVID }, [], function (err, doc) {
           if (err) {
               res.json({ "status": "Not ok", "errDesc": err.errmsg.toString() })
           } else {
               if (sess.userId == doc.user_strId) {
                   var queryParams = {"_id":params.refillId};
                    genericFn.genericCRUD("delete", "refillDetails","", queryParams, "", function () {
                       if (err) { res.json("unable to delete") }
                       else {
                           res.json("Deleted successfully");
                       }
                   });
               }else{
                   res.json("Not authorized");
               }             
           }
       });
   }
   
}
