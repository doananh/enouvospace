var _         = require('underscore');
var UserUtil  = require('./models/userModel');

Parse.Cloud.define('checkLogin', function(request, response) {
  var params = request.params;
  Parse.User.logIn(params.username, params.password, {useMasterKey: true}).then(function(user) {
    if (user) {
      var isDisabled = user.get("disabled");
      if (isDisabled) {
        response.error('user is not log in review system');
      } else {
        response.success(user);
      }
    }
  }, function(error) {
    response.error(error);
  });
});

Parse.Cloud.define('deleteUser', function(request, response) {
  var userId = request.params.objectId;
  if (userId) {
    var query = new Parse.Query(Parse.User);
    query.get(userId).then(function (user) {
      user.destroy({ useMasterKey: true }).then(function (data) {
        response.success(data);
      }, function (error) {
        response.error(error);
      });
    }, function (error) {
      response.error(error);
    });
  }
  else {
    response.error('Require user id params for deleting user')
  }
});

Parse.Cloud.define("updateUser", function(req, res) {
  var params = req.params;
  var query = new Parse.Query(Parse.User);
  query.equalTo("objectId", params.objectId);
  query.first().then(function(currentUser) {
    if (currentUser) {
      currentUser.set('disabled', params.disabled || false);
      if (params.username) {
        currentUser.set('username', params.username);
        if (params.phoneNo) {
          currentUser.set('phoneNo', params.phoneNo);
        }
        if (params.email) {
          currentUser.set('email', params.email);
        }
      }
      if (params.role) {
        currentUser.set('role', params.role)
      }
      if (params.staffs) {
        currentUser.set('staffs', params.staffs)
      }
      if (params.business) {
        currentUser.set('business', params.business)
      }

      if (params.avatar) {
        currentUser.set('avatar', params.avatar)
      }

      currentUser.save(null, {useMasterKey: true}).then(function(user) {
        res.success(user);
      }, function(err) {
        res.error(err);
      });
    } else {
      res.error("update combo err");
    }
  }, function(err) {
    res.error(err);
  });
});

Parse.Cloud.beforeDelete(Parse.User, function(request, response) {
  var staffData = request.object.toJSON();
  UserUtil.getOwnerUserWithStaff(staffData).then(function(result) {
    if (result) {
      var staffs = result.get("staffs");
      if (staffs && staffs.length) {
        var staffArray = [];
        _.each(staffs, function(staff) {
          if (staff.id !== staffData.objectId) {
            staffArray.push({ "__type": "Pointer", "className": "_User", "objectId": staff.id });
          }
        });
        result.set("staffs", staffArray);
        result.save(null, { useMasterKey: true });
      }
    }
    response.success();
  }, function(error) {
    response.error(error);
  });
});
