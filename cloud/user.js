var _ = require('underscore');

Parse.Cloud.define("updateUser", function(req, res) {
  var params = req.params;
  console.log(params);
  var query = new Parse.Query(Parse.User);
  query.equalTo("objectId", params.objectId);
  query.first().then(function(currentUser) {
    if (currentUser) {
      currentUser.set('username', params.username);
      currentUser.set('email', params.email);
      currentUser.set('mobile', params.mobile);
      currentUser.set('address', params.address);
      currentUser.save(null, {useMasterKey: true}).then(function(user) {
        res.success(user);
      }, function(err) {
        res.error(err);
      });
    } else {
      res.error("update user err");
    }
  }, function(err) {
    res.error(err);
  });
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