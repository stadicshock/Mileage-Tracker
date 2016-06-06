var apiFunctions = require('./controllers/apiFunctions');
var genericFuncs = require('./controllers/genericFunctions');
 
module.exports = function(app){
  app.route('/signup')
    .post(apiFunctions.signup);
  app.route('/forgotpassword')
    .post(apiFunctions.forgotpassword);
  app.route('/Login')
    .post(apiFunctions.usrLogin);
  app.route('/Logout')
    .post(apiFunctions.usrLogout);
 app.route('/ChangePassword')
    .post(apiFunctions.changePasswod);
 app.route("/GenericCrud")
    .post(apiFunctions.genericfunctions);
 app.route("/UVCrud")
    .post(apiFunctions.bindUserVehicleCRUD);
 app.route("/AddRefill")
    .post(apiFunctions.addRefilling);
 app.route("/UpdateRefill")
    .post(apiFunctions.updateRefilling);
 app.route("/DeleteRefill")
    .post(apiFunctions.deleteRefilling);
};