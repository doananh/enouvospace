var _ = require('underscore');
var moments = require('moment');
var tools = require('./tools');

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

function getRandomString() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
  var randomstring = '';
  var randomNumber = Math.floor(Math.random() * chars.length);
  randomstring += chars.substring(randomNumber,randomNumber+1);
  return randomstring;
}