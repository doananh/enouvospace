
var _        = require('underscore');
var moments  = require('moment');

var Tool            = require('./../utils/tools');
var DiscountModel   = require('./discountModel');
var PackageModel    = require('./packageModel');
var GlobalVariable  = require('./globalVariable');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

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
      GlobalVariable.generateAnonymousCode().then(function (latestCode) {
        var bookingParams = _.extend({}, _params, {"package": defaultPackage});
        createNewBooking(bookingParams, latestCode).then(function (data) {
          resolve({code: latestCode});
        }, function (error) {
          reject(error);
        });
      }, function (bookingError) {
        reject(bookingError);
      });
    }, function (packageError) {
      reject(packageError);
    });
  });
}

function createNewBooking(_params, _code = null) {
  var Booking = Parse.Object.extend("Booking");
  var booking = new Booking();
  booking.set("status", "OPEN");
  booking.set("isPaid", false);
  booking.set("payAmount", 0);
  booking.set("startTime", moments().toDate());
  booking.set("packageCount", 1);
  if (_code) {
    booking.set("user", {"code": _code, "username": "anonymous " + _code, type: "anonymous"});
  }
  else {
    booking.set("user", {"id": _params.user.id, "username": _params.user.username, type: "customer"});
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
  return bookingQuery.first();
}

exports.createBookingForLoginUser     = createBookingForLoginUser;
exports.createBookingForAnonymousUser = createBookingForAnonymousUser;
exports.createNewBooking              = createNewBooking;
exports.getAnonymousUserInBooking     = getAnonymousUserInBooking;
