var Tool = require('./Tool');
var moments = require('moment');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL


function createBookingForLoginUser(_params, res) {
  return createNewBooking({ __type: "Pointer", className: "_User", objectId: _params.UserId }, _params, null);
}

function createBookingForAnonymousUser(_params, _res) {
  var code;
  getBooking().then(function (data) {
    if (data) {
      var lastCode = data.get("code");
      code = Tool.getCode(lastCode);
    } else {
      code = Tool.getCode();
    }
    createNewBooking(null, _params, code).then(function (data) {
      _res.success({ code: code});
    }, function (error) {
      _res.error(error);
    });
  }, function (error) {
  });
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

function getBooking () {
  var bookingQuery = new Parse.Query("Booking");
      bookingQuery.select("code");
      bookingQuery.descending("code");
  return  bookingQuery.first();
}

function getAnonymousUserInBooking (_params) {
  var bookingQuery = new Parse.Query("Booking");
    bookingQuery.equalTo("code", _params.code);
    bookingQuery.include("package");
    bookingQuery.include('discount');
  return  bookingQuery.first();
}

exports.createBookingForLoginUser     = createBookingForLoginUser;
exports.createBookingForAnonymousUser = createBookingForAnonymousUser;
exports.getBooking                    = getBooking;
exports.createNewBooking              = createNewBooking;
exports.getAnonymousUserInBooking     = getAnonymousUserInBooking;
