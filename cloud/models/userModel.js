var _ = require('underscore');
const Parse = require('parse/node');

function getUserWithBusiness (_businessData) {
  var userQuery = new Parse.Query("User");
  userQuery.equalTo("business", { "__type": "Pointer", "className": "Business", "objectId": _businessData.objectId });
  userQuery.include("business");
  return userQuery.find();
}

function getUserWithId (_id) {
  var userQuery = new Parse.Query("User");
  return userQuery.get(_id, { useMasterKey: true });
}

function loginWithEmail (params) {
  return new Promise((resolve, reject) => {
      var userQuery = new Parse.Query(Parse.User);
      var email     = params.email;
      var password  = params.password;
      userQuery.equalTo("email", email);
      userQuery.first({useMasterKey: true})
      .then(function (user) {
          if (user) {
            var username = user.get('username');
            if (username && username.length) {
              return user;
            }
            else {
              var username = email.split('@')[0];
              user.set("username", username);
              return user.save(null, {useMasterKey:true});
            }
          }
          else {
            return reject("This email hasn't been registered");
          }
      })
      .then(function (user) {
          var username = user.get('username');
          return Parse.User.logIn(username, password);
      })
      .then(function (response) {
          return resolve(response.toJSON());
      })
      .catch(function (error) {
          return reject(error);
      })
  });
}

exports.loginWithEmail      = loginWithEmail;
exports.getUserWithBusiness = getUserWithBusiness;
exports.getUserWithId       = getUserWithId;
