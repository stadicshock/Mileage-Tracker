var apiFunctions = require('./controllers/apiFunctions');

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

};