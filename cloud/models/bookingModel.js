
var _        = require('underscore');
var moments  = require('moment');
var Constants = require('./../constant');

var Tool            = require('./../utils/tools');
var DiscountModel   = require('./discountModel');
var PackageModel    = require('./packageModel');
var GlobalVariable  = require('./globalVariable');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

function createBookingForLoginUser(_params) {
  return new Promise((resolve, reject) => {
    var packageType = _params.packageType;
    if (Constants.PACKAGE_TYPES.indexOf(packageType) < 0) {
      reject('Require params packageType for createBookingForLoginUser');
    }
    else {
      PackageModel.getPackageByType(packageType).then(function (result) {
        var bookingParams = _.extend({}, _params, {"package": result});
        return createNewBooking(bookingParams).then(function (data) {
          resolve(data);
        }, function (error) {
          reject(error);
        });
      }, function (error) {
        reject(error);
      });
    }
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
  booking.set("discountAmount", 0);

  booking.set("startTime", moments().toDate());
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

  if (_params.packageCount) {
    booking.set("packageCount", _params.packageCount);
  }
  else {
    booking.set("packageCount", 1);
  }

  return booking.save();
}

function getBookingByCode (_code) {
  return new Promise((resolve, reject) => {
    var bookingQuery = new Parse.Query("Booking");
    bookingQuery.equalTo("user.code", _code);
    bookingQuery.first().then(function(bookingData) {
      if (bookingData) {
        resolve(bookingData);
      }
      else {
        reject('no booking found with ' + _id);
      }
    }, function(error) {
      reject(error);
    });
  });
}

function getBookingById (_id) {
  return new Promise((resolve, reject) => {
    var bookingQuery = new Parse.Query("Booking");
    bookingQuery.get(_id).then(function(bookingData) {
      if (bookingData) {
        resolve(bookingData);
      }
      else {
        reject('no booking found with ' + _id);
      }
    }, function(error) {
      reject(error);
    });
  });
}

exports.createBookingForLoginUser     = createBookingForLoginUser;
exports.createBookingForAnonymousUser = createBookingForAnonymousUser;
exports.createNewBooking              = createNewBooking;
exports.getBookingByCode              = getBookingByCode;
exports.getBookingById                = getBookingById;
