var _ = require('lodash');
var UserModel = require('./models/userModel');

Parse.Cloud.define('getUser', function(request, response) {
  var userParams = request.params;
  var userQuery = new Parse.Query(Parse.User);
  userQuery.get(userParams.userId, {useMasterKey: true}).then(function(userData) {
    response.success(userData);
  }, function(err) {
    response.error(err);
  });
});

Parse.Cloud.define('getUsers', function(request, response) {
  var userQuery = new Parse.Query(Parse.User);
  userQuery.find({useMasterKey: true}).then(function(users) {
    response.success(users);
  }, function(err) {
    response.error(err);
  });
});

Parse.Cloud.define("createUser", function(req, res) {
  var params    = req.params;
  UserModel.createUserDocument(params)
  .then(function (response) {
    return res.success(response);
  })
  .catch(function (error) {
      return res.error(error);
  });
});

Parse.Cloud.define("loginWithEmail", function(req, res) {
  var params    = req.params;
  UserModel.loginWithEmail(params)
  .then(function (response) {
      return res.success(response);
  })
  .catch(function (error) {
      return res.error(error);
  });
});

Parse.Cloud.define("updateUser", function(req, res) {
  var params = req.params;
  var query = new Parse.Query(Parse.User);
  query.equalTo("objectId", params.objectId);
  query.first().then(function(currentUser) {
      if (currentUser) {
        currentUser.set('username', params.username);
        currentUser.set('email', params.email);
        currentUser.set('mobile', params.mobile);
        currentUser.set('address', params.address);
        currentUser.set("name", params.name);
        currentUser.set("job", params.job);
        currentUser.set("note", params.note);
        currentUser.set("source", params.source);
        currentUser.set("facebookLink", params.facebookLink);
        currentUser.set("instaLink", params.instaLink);
        currentUser.set("nationality", params.nationality);
        if (params.avatar) {
          currentUser.set("avatar", params.avatar);
        }
        return currentUser.save(null, {useMasterKey: true})
      }
      else {
        return res.error("update user err");
      }
  })
  .then(function (saveResult) {
      return res.success(saveResult);
  })
  .catch(function (error) {
      return res.error(error);
  })
});

Parse.Cloud.define('deleteUser', function(request, response) {
  var query = new Parse.Query(Parse.User);
  query.get(request.params.objectId).then(function (user) {
    user.destroy({ useMasterKey: true }).then(function (data) {
      response.success(data);
    }, function (error) {
      response.error(error);
    });
  }, function (error) {
    response.error(error);
  });
});

Parse.Cloud.define('requestPasswordReset', function(req, res) {
  var email = req.params.email;
  Parse.User.requestPasswordReset(email, {})
  .then( function (result) {
    return res.success(result);
  })
  .catch( function (error) {
    return res.error(error);
  });
});
