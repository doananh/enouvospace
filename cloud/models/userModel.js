var _ = require('underscore');

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

function createUserDocument (data) {
  var User = Parse.Object.extend(Parse.User);
  var user = new User();
  user.set("username", data.username);
  user.set("password", data.password);
  user.set("email", data.email);
  user.set("mobile", data.mobile);
  user.set("name", data.name);
  user.set("job", data.job);
  user.set("note", data.note);
  user.set("source", data.source);
  user.set("facebookLink", data.facebookLink);
  user.set("instaLink", data.instaLink);
  user.set("address", data.address);
  user.set("nationality", data.nationality);
  if (data.roleName) {
    user.set("roleName", data.roleName);
  } else {
    user.set("roleName", 'USER');
  }
  if (data.avatar) {
    user.set("avatar", data.avatar);
  }
  return user.save(null, { useMasterKey: true });
}

function changePassword (params) {
  return new Promise((resolve, reject) => {
    var userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo("objectId", params.objectId);
    userQuery.first().then(function(currentUser) {
        if (currentUser) {
          currentUser.set('password', params.newPassword);
          return currentUser.save(null, {useMasterKey: true})
        } else {
          return reject("update user err");
        }
    })
    .then(function (saveResult) {
        return resolve(saveResult);
    })
    .catch(function (error) {
        return reject(error);
    })
  })
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
            return reject("Invalid username/password");
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

function getAllAdmin () {
  var userQuery = new Parse.Query("User");
    userQuery.equalTo("roleName", "ADMIN");
  return userQuery.find({useMasterKey: true});
}
exports.changePassword = changePassword;
exports.createUserDocument = createUserDocument;
exports.getAllAdmin = getAllAdmin;
exports.loginWithEmail      = loginWithEmail;
exports.getUserWithBusiness = getUserWithBusiness;
exports.getUserWithId       = getUserWithId;
