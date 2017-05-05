
var _        = require('underscore');
var moment   = require('moment');

var Constants = require('./../constant.js');
var Tool            = require('./../utils/tools.js');
var DiscountModel   = require('./discountModel.js');
var PackageModel    = require('./packageModel.js');
var GlobalVariable  = require('./globalVariable.js');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

function createBookingForLoginUser(_params) {
  return new Promise((resolve, reject) => {
    var packageId = _params.packageId;
    if (packageId) {
      PackageModel.getPackageById(packageId).then(function (packageData) {
        var bookingParams = _.extend({}, _params, {"package": packageData.toJSON()});
        return createNewBooking(bookingParams, null);
      })
      .then(function (data) {
        var startTime = data.get('startTime');
        return resolve({checkinTime: startTime.toISOString()});
      })
      .catch( function (error) {
        return reject(error);
      });
    }
    else {
      return reject('Require params packageId for createBookingForLoginUser');
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
        var bookingId = data.id;
        var responseData = {
          checkinTime: startTime,
          username: user.username,
          code: user.code,
          bookingId: bookingId
        }
        return resolve(responseData);
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

    if (_params.startTime) {
      booking.set("startTime", new Date(_params.startTime));
    }
    else {
      booking.set("startTime", moment().toDate());
    }

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
      GlobalVariable.getAnonymousPackage()
      .then( function (anonymousPackage) {
        booking.set("package", anonymousPackage.toJSON());
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

function getBookingByParams (_params) {
  return new Promise((resolve, reject) => {
    var bookingQuery = new Parse.Query("Booking");
    if (_params.code || _params.bookingId || _params.userId) {
      if (_params.code) {
        bookingQuery.equalTo("user.code", _params.code);
      }
      if (_params.bookingId) {
        bookingQuery.equalTo("objectId", _params.bookingId);
      }
      if (_params.userId) {
        bookingQuery.equalTo("user.id", _params.userId);
      }
    }
    else {
      return reject('Require code | bookingId params | userId');
    }

    if (!_.isUndefined(_params.status)) {
      bookingQuery.equalTo("status", _params.status);
    }

    if (_params.latest) {
      bookingQuery.descending("createdAt");
    }

    bookingQuery.find().then( function (booking) {
      if (booking && booking.length) {
        if (_params.status) {
          return resolve(booking[0]);
        }
        else if (booking[0].get('status') === 'CLOSED') {
          throw('Your booking has been closed. Please request new one or contact reception.');
        }
        return resolve(booking[0]);
      }
      else {
        throw('No booking found.');
      }
    })
    .catch( function (error) {
      return reject(error);
    });
  });
}

function getLastValidUserBooking (_params) {
  return new Promise((resolve, reject) => {
    var bookingQuery = new Parse.Query("Booking");
    if (_params.userId) {
      bookingQuery.equalTo("user.id", _params.userId);
    }
    else {
      return reject('Require user id params');
    }
    bookingQuery.descending("createdAt");
    bookingQuery.equalTo("status", "OPEN");
    bookingQuery.first().then( function (bookings) {
      return resolve(bookings);
    })
    .catch( function (error) {
      return reject(error);
    });
  });
}

function getUserBooking (_params) {
  return new Promise((resolve, reject) => {
    var bookingQuery = new Parse.Query("Booking");
    if (_params.userId) {
      bookingQuery.equalTo("user.id", _params.userId);
    }
    else {
      return reject('Require userId');
    }
    bookingQuery.descending("createdAt");
    bookingQuery.find().then( function (bookings) {
      return resolve(bookings);
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
exports.getUserBooking                = getUserBooking;
exports.getLastValidUserBooking       = getLastValidUserBooking;
