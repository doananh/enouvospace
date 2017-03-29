
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
      return reject('Require params packageType for createBookingForLoginUser');
    }
    else {
      PackageModel.getPackageByType(packageType).then(function (result) {
        var bookingParams = _.extend({}, _params, {"package": result});
        return createNewBooking(bookingParams, null);
      })
      .then(function (data) {
        return resolve(data);
      })
      .catch( function (error) {
        return reject(error);
      });
    }
  });
}

function createBookingForAnonymousUser(_params) {
  return new Promise((resolve, reject) => {
    GlobalVariable.generateAnonymousCode()
    .then( function (latestCode){
      return createNewBooking(_params, latestCode);
    })
    .then( function (data) {
      if (data) {
        var startTime = data.get('startTime');
        var user = data.get('user');
        var code = user.code;
        return resolve({code: code, checkinTime: startTime});
      }
      else {
        throw('No booking data');
      }
    })
    .catch ( function (error) {
      return reject(error);
    });
  });
}

function createNewBooking(_params, _code) {
  return new Promise((resolve, reject) => {
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

    if (_params && _params.package) {
      booking.set("package", _params.package);
      booking.save().then( function (bookingData) {
        return resolve(bookingData);
      })
      .catch( function (error) {
        return reject(error);
      });
    }
    else {
      PackageModel.getDefaultPackage()
      .then( function (defaultPackage) {
        booking.set("package", defaultPackage);
        return booking.save();
      })
      .then( function (bookingData) {
        return resolve(bookingData);
      })
      .catch( function (error) {
        return reject(error);
      });
    }
  });
}

function closeBookingWithParams (_params) {
  return new Promise((resolve, reject) => {
    var bookingQuery = new Parse.Query("Booking");
    if (_params.code) {
      bookingQuery.equalTo("user.code", _params.code);
    }
    else if (_params.bookingId) {
      bookingQuery.equalTo("objectId", _params.bookingId);
    }
    else {
      return reject('Require code or bookingId params for closing Booking');
    }

    bookingQuery.first().then( function (booking) {
      if (booking) {
        booking.set("status", "CLOSED");
        return booking.save();
      }
      else {
        throw('No booking found closing');
      }
    })
    .then( function (bookingData) {
      return resolve(bookingData);
    })
    .catch( function (error) {
      return reject(error);
    });
  });
}

function getBookingByParams (_params) {
  return new Promise((resolve, reject) => {
    var bookingQuery = new Parse.Query("Booking");
    if (_params.code) {
      bookingQuery.equalTo("user.code", _params.code);
    }
    else if (_params.bookingId) {
      bookingQuery.equalTo("objectId", _params.bookingId);
    }
    else {
      return reject('Require code or bookingId params for closing Booking');
    }
    bookingQuery.first().then( function (booking) {
      if (booking) {
        return resolve(booking);
      }
      else {
        throw('No booking found closing');
      }
    })
    .catch( function (error) {
      return reject(error);
    });
  });
}

exports.createBookingForLoginUser     = createBookingForLoginUser;
exports.createBookingForAnonymousUser = createBookingForAnonymousUser;
exports.createNewBooking              = createNewBooking;
exports.getBookingByParams            = getBookingByParams;
exports.closeBookingWithParams        = closeBookingWithParams;
