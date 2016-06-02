
var express= require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');

app.use(session({secret: 'mileageTracker'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//app.use(bodyParser());
require("./api/route")(app);
console.log("server started");

var publicFolder=require('path').join(__dirname +"/public");
app.use(express.static(publicFolder));

process.on('uncaughtException', function (error) { 
    console.log(error.stack); 
});

app.listen("8080","localhost");


