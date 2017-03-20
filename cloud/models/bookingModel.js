
var _        = require('underscore');
var moments  = require('moment');

var Tool          = require('./../utils/tools');
var DiscountModel = require('./discountModel');
var PackageModel  = require('./packageModel');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

var currentAnonymousCode = null;

function createBookingForLoginUser(_params) {
  return new Promise((resolve, reject) => {
    PackageModel.getPackageByType().then(function (result) {
      var bookingParams = _.extend({}, _params, {"package": result});
      return createNewBooking(bookingParams).then(function (data) {
        resolve(data);
      }, function (error) {
        reject(error);
      });
    }, function (error) {
      reject(error);
    });
  });
}

function createBookingForAnonymousUser(_params) {
  return new Promise((resolve, reject) => {
    PackageModel.getDefaultPackage().then(function (defaultPackage) {
      console.log(defaultPackage)
      if (currentAnonymousCode) {
        currentAnonymousCode = Tool.getCode(currentAnonymousCode);
      } else {
        currentAnonymousCode = Tool.getCode();
      }
      var bookingParams = _.extend({}, _params, {"package": defaultPackage});
      createNewBooking(bookingParams, currentAnonymousCode).then(function (data) {
        resolve({code: currentAnonymousCode});
      }, function (error) {
        reject(error);
      });
    }, function (error) {
      reject(error);
    });
  });
}

function createNewBooking(_params, _code = null) {
  console.log(_params)
  var Booking = Parse.Object.extend("Booking");
  var booking = new Booking();
  booking.set("status", "OPEN");
  booking.set("isPaid", false);
  booking.set("payAmount", 0);
  booking.set("startTime", moments().toDate());
  booking.set("packageCount", 1);
  if (_code) {
    booking.set("user", {"code": _code, "username": "anonymous" + _code});
  }
  else {
    booking.set("user", {"id": _params.UserId, "username": _params.user.sername});
  }
  if (_params && _params.DiscountId) {
    booking.set("discount", {__type: "Pointer", className: "Discount", objectId: _params.DiscountId});
  }
  else {
    booking.set("discount", null);
  }
  if (_params && _params.package) {
    booking.set("package", _params.package);
  }
  if (_params && _params.numOfUsers) {
    booking.set("numOfUsers", _params.numOfUsers);
  }
  else {
    booking.set("numOfUsers", 1);
  }

  return booking.save();
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
exports.createNewBooking              = createNewBooking;
exports.getAnonymousUserInBooking     = getAnonymousUserInBooking;
