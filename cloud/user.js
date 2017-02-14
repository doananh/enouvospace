var _ = require('underscore');
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

Parse.Cloud.define("checkin", function(req, res) {
  var params = req.params;
  var createNew;
  var randomString = getRandomString();
  var randomNumber = createRandomNumber();
  var code = randomString.concat(randomNumber);
  console.log(code)
  if (code) {
    if (params.UserId !== null) {
      createNew = createNewBooking({ __type: "Pointer", className: "_User", objectId: params.UserId }, params, code);
    } else {
      createNew = createNewBooking(null, params, code);
    }
    Parse.Promise.when(createNew).then(
    function(v1, v2) { res.success({ code: code}); },
    function(error) { res.error(error); }
  )
  }
});

function createRandomNumber() {
  var numbers = getRndInteger(0, 9);
  var randomNumber = ""
  for ( var i = 0; i<3; i++ ) {
      randomNumber += numbers;
  }
  return randomNumber;
}

function getRandomString() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
  var randomstring = '';
  var randomNumber = Math.floor(Math.random() * chars.length);
  randomstring += chars.substring(randomNumber,randomNumber+1);
  return randomstring;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function createNewBooking(_userData, _params, _code) {
  console.log(_userData);
  var Booking = Parse.Object.extend("Booking");
  var booking = new Booking();
  var promise = new Parse.Promise();
  booking.set("user", _userData);
  booking.set("business", { __type: "Pointer", className: "Business", objectId: _params.BusinessId });
  booking.set("package", { __type: "Pointer", className: "Package", objectId: _params.PackageId });
  booking.set("packageCount", 1);
  booking.set("code", _code);
  booking.set("status", "Pending");
  booking.set("isPaid", false);
  booking.set("numOfUsers", 1);
  booking.set("discount", null);
  booking.save().then(
    function(value) { promise.resolve(value); },
    function(error) { promise.reject(error); }
  )
  return promise;
}

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
  getOwnerByPointer(staffData).then(function(result) {
    if (result) {
      var staffs = result.get("staffs");
      if (staffs.length > 0) {
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

function getOwnerByPointer(_staffData) {
  var ownerQuery = new Parse.Query(Parse.User);
  ownerQuery.equalTo("staffs", { "__type": "Pointer", "className": "_User", "objectId": _staffData.objectId });
  ownerQuery.include("staffs");
  return ownerQuery.first();
}
