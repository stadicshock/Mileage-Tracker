var mango = require("mongodb").MongoClient;
var config = require("../../config").config;
var helperFn = require("./helperFunctions");
var genericFn = require("./genericFunctions");

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
    var usrPassword = crypt.encrypt(params.password);
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
          sess.name=item.user_strName
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
