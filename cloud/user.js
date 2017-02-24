var _ = require('underscore');
var moments = require('moment');
var tools = require('./tools');

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
  if (params.UserId !== null) {
    createBookingForLoginUser(params, res)
    .then(function (data) {
      return res.success({ status: 'checkin success'});
    }, function (error) {
      return res.error(error);
    });
  } else {
    createBookingForAnonymousUser(params, res);
  }
});

function createBookingForLoginUser(_params, res) {
  return createNewBooking({ __type: "Pointer", className: "_User", objectId: _params.UserId }, _params, null);
}

function createBookingForAnonymousUser(_params, _res) {
  var code;
  getBooking().then(function (data) {
    if (data) {
      var lastCode = data.get("code");
      code = tools.getCode(lastCode);
    } else {
      code = tools.getCode('A000');
    }
    createNewBooking(null, _params, code).then(function (data) {
      _res.success({ code: code});
    }, function (error) {
      _res.error(error);
    });
  }, function (error) {
  });
}

function getBooking () {
  var bookingQuery = new Parse.Query("Booking");
      bookingQuery.select("code");
      bookingQuery.descending("code");
  return  bookingQuery.first();
}

function createNewBooking(_userData, _params, _code) {
  var Booking = Parse.Object.extend("Booking");
  var booking = new Booking();
  booking.set("user", _userData);
  booking.set("business", { __type: "Pointer", className: "Business", objectId: _params.BusinessId });
  booking.set("package", { __type: "Pointer", className: "Package", objectId: _params.PackageId });
  booking.set("packageCount", 1);
  booking.set("code", _code);
  booking.set("status", "Pending");
  booking.set("isPaid", false);
  booking.set("numOfUsers", 1);
  booking.set("startTime", moments().toDate());
  if (_params && _params.DiscountId) {
    booking.set("discount", { __type: "Pointer", className: "Discount", objectId: _params.DiscountId });
  } else {
    booking.set("discount", null);
  }
  return booking.save();
}

Parse.Cloud.define("checkout", function(req, res) {
  var params = req.params;
  getAnonymousUserInBooking(params)
  .then(function (user) {
    var startTime = user.get("startTime");
    var discountAmount = user.get("discountAmount");
    var packageData = user.get("package").toJSON();
    var packageType = packageData.type;
    var packageRate = packageData.chargeRate;
    var subtractTime = moments().diff(moments(startTime));
    var durationTimeDetails = moments.duration(subtractTime);
    var durationTime = durationTimeDetails.hours() + ":" + durationTimeDetails.minutes();
    var totalPrice = 0;
    var data = {
      checkinTime: startTime,
      checkoutTime: moments().toDate(),
      packageType: packageType,
      packageRate: packageRate,
      durationTime: durationTime,
      discountAmount: discountAmount,
      totalPrice: totalPrice 
    };
    res.success(data);
  }, function (error) {
    res.error(error);
  });
});

function getAnonymousUserInBooking (_params) {
  var bookingQuery = new Parse.Query("Booking");
    bookingQuery.equalTo("code", _params.code);
    bookingQuery.include("package");
  return  bookingQuery.first();
}

function getRandomString() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
  var randomstring = '';
  var randomNumber = Math.floor(Math.random() * chars.length);
  randomstring += chars.substring(randomNumber,randomNumber+1);
  return randomstring;
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
