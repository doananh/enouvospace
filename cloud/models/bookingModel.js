var moments = require('moment');
var Tool = require('./../utils/tools');
var DiscountModel = require('./discountModel');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

const PACKAGE_DEFAULT = {__type: "Pointer", className: "Package", objectId: "5VEub2n51G"};

function createBookingForLoginUser(_params) {
  return createNewBooking(_params);
}

function createBookingForAnonymousUser(_params) {
  return new Promise((resolve, reject) => {
    getLastAnonymousBooking().then(function (data) {
      var code;
      var lastCode = data.get("code");
      if (lastCode) {
        code = Tool.getCode(lastCode);
      } else {
        code = Tool.getCode();
      }
      createNewBooking(_params, code).then(function (data) {
        resolve({code: code});
      }, function (error) {
        reject(error);
      });
    }, function (error) {
      reject(error);
    });
  });
}

function createNewBooking(_params, _code = null) {
  var Booking = Parse.Object.extend("Booking");
  var booking = new Booking();
  booking.set("code", _code);
  booking.set("status", "Pending");
  booking.set("isPaid", false);
  booking.set("payAmount", 0);
  booking.set("startTime", moments().toDate());
  booking.set("packageCount", 1);
  if (_params && _params.UserId) {
    booking.set("user", {__type: "Pointer", className: "_User", objectId: _params.UserId});
  }
  if (_params && _params.DiscountId) {
    booking.set("discount", {__type: "Pointer", className: "Discount", objectId: _params.DiscountId});
  }
  else {
    booking.set("discount", null);
  }
  if (_params && _params.PackageId) {
    booking.set("package", {__type: "Pointer", className: "Package", objectId: _params.PackageId});
  }
  else {
    booking.set("package", PACKAGE_DEFAULT);
  }
  if (_params && _params.numOfUsers) {
    booking.set("numOfUsers", _params.numOfUsers);
  }
  else {
    booking.set("numOfUsers", 1);
  }

  return booking.save();
}

function getLastAnonymousBooking () {
  var bookingQuery = new Parse.Query("Booking");
      bookingQuery.select("code");
      bookingQuery.descending("code");
  return bookingQuery.first();
}

function getAnonymousUserInBooking (_params) {
  var bookingQuery = new Parse.Query("Booking");
    bookingQuery.equalTo("code", _params.code);
    bookingQuery.include("package");
    bookingQuery.include('discount');
  return bookingQuery.first();
}

exports.createBookingForLoginUser     = createBookingForLoginUser;
exports.createBookingForAnonymousUser = createBookingForAnonymousUser;
exports.getLastAnonymousBooking       = getLastAnonymousBooking;
exports.createNewBooking              = createNewBooking;
exports.getAnonymousUserInBooking     = getAnonymousUserInBooking;
