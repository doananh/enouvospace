var _ = require('lodash');

Parse.Cloud.define('getUsers', function(request, response) {
  var userQuery = new Parse.Query(Parse.User);
  userQuery.find({useMasterKey: true}).then(function(users) {
    response.success(users);
  }, function(err) {
    response.error(err);
  });
});

Parse.Cloud.define("loginWithEmail", function(req, res) {
  var userQuery = new Parse.Query(Parse.User);
  var params    = req.params;
  var email     = params.email;
  var password  = params.password;
  userQuery.equalTo("email", email);
  userQuery.first({useMasterKey: true})
  .then(function (user) {
      var username = user.get('username');
      if (username && username.length) {
        return user;
      }
      else {
        var username = email.split('@')[0];
        user.set("username", username);
        return user.save(null, {useMasterKey:true});
      }
  })
  .then(function (user) {
      var username = user.get('username');
      return  Parse.User.logIn(username, password);
  })
  .then(function (response) {
      return res.success(response);
  })
  .catch(function (error) {
      return res.error(err);
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
