
var _        = require('underscore');
var moment   = require('moment');

var Constants       = require('./../constant.js');
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
      var user      = _params.user;
      if (packageId) {
        getLastValidUserBooking({user: user})
        .then(function (lastValidBooking) {
            if (lastValidBooking) {
              throw('you can only register one booking');
            }
            else {
              return PackageModel.getPackageById(packageId);
            }
        })
        .then(function (packageData) {
            var bookingParams = _.extend({}, _params, {"package": packageData.toJSON()});
            return createNewBooking(bookingParams, null);
        })
        .then(function (data) {
            return resolve(data.toJSON());
        })
        .catch(function (error) {
            return reject(error);
        });
      }
      else {
        return reject('Missing packageId params');
      }
  });
}

function createBookingForAnonymousUser(_params) {
  return new Promise((resolve, reject) => {
      GlobalVariable.generateAnonymousCode()
      .then(function (latestCode){
          return createNewBooking(_params, latestCode);
      })
      .then(function (bookingData) {
          if (bookingData) {
            return resolve(bookingData);
          }
          else {
            throw('No booking data');
          }
      })
      .catch(function (error) {
          return reject(error);
      });
  });
}

function createNewBooking(_params, _code) {
  return new Promise((resolve, reject) => {
      var Booking = Parse.Object.extend("Booking");
      var booking = new Booking();

      booking.set("isPaid", false);
      booking.set("payAmount", 0);
      booking.set("discountAmount", 0);
      booking.set("hasCheckined", false);

      if (_code) {
        booking.set("status", "OPEN");
      }
      else {
        booking.set("status", "PENDING");
      }

      if (_params.startTime) {
        booking.set("startTime", new Date(_params.startTime));
      }
      else {
        booking.set("startTime", moment().toDate());
      }

      if (_params.endTime) {
        booking.set("endTime", new Date(_params.endTime));
      }

      if (_params.packageCount) {
        booking.set("packageCount", _params.packageCount);
      }

      if (_code) {
        booking.set("user", {"code": _code, "username": "anonymous" + _code, "name": "anonymous " + _code, type: "anonymous"});
      }
      else {
        booking.set("user", {"id": _params.user.id, "username": _params.user.username, "name": _params.user.name, type: "customer"});
      }

      if (_params && _params.numOfUsers) {
        booking.set("numOfUsers", _params.numOfUsers);
      }
      else {
        booking.set("numOfUsers", 1);
      }

      // anonymous package pointer default on GlobalVariable Table
      if (_params && _params.package) {
        booking.set("package", _params.package);
        booking.save()
        .then(function (bookingData) {
            return resolve(bookingData);
        })
        .catch(function (error) {
            return reject(error);
        });
      }
      else {
        GlobalVariable.getAnonymousPackage()
        .then(function (anonymousPackage) {
            booking.set("package", anonymousPackage.toJSON());
            return booking.save();
        })
        .then(function (bookingData) {
            return resolve(bookingData);
        })
        .catch(function (error) {
            return reject(error);
        });
      }
  });
}

function getBookingByParams (_params) {
  return new Promise((resolve, reject) => {
      var query = new Parse.Query("Booking");
      var anonymousCode = _params.code;
      var userId        = _params.user && _params.user.id;
      var bookingId     = _params.id;
      var sortByTime    = _params.sortByTime;
      var status        = _params.status;
      var valid         = _params.valid;
      var isHistory     = _params.isHistory;
      var isUserBooking = _params.isUserBooking;
      if (anonymousCode || userId || bookingId) {
        if (anonymousCode) {
          query.equalTo("user.code", anonymousCode);
        }
        if (bookingId) {
          query.equalTo("objectId", bookingId);
        }
        if (userId) {
          query.equalTo("user.id", userId);
        }
      }
      else {
        return reject('Require code | booking id | user id params');
      }

      if (valid) {
        query.notContainedIn("status", ["CLOSED", "CANCELED"]);
      }
      else if (isHistory) {
        query.equalTo("status", "CLOSED");
      }
      else if (isUserBooking) {
        query.containedIn("status", ["CLOSED", "OPEN", "PENDING"]);
      }
      else if (!_.isUndefined(status)) {
        query.equalTo("status", status);
      }

      if (sortByTime) {
        query.descending("createdAt");
      }

      // Determine return one booking or an array of bookings
      if (bookingId || anonymousCode) {
        query.first()
        .then(function (bookingData) {
            return resolve(bookingData);
        })
        .catch(function (error) {
            return reject(error);
        });
      }
      else {
        query.find()
        .then(function (bookings) {
            return resolve(bookings);
        })
        .catch(function (error) {
            return reject(error);
        });
      }
  });
}

function getLastValidUserBooking (_params) {
  return new Promise((resolve, reject) => {
    var query = new Parse.Query("Booking");
    var user = _params.user;
    if (user && user.id) {
      getBookingByParams({user: user, valid: true, sortByTime: true})
      .then(function (bookings) {
          if (bookings && bookings.length) {
            return resolve(bookings[0]);
          }
          return resolve(null);
      })
      .catch(function (error) {
          return reject(error);
      });
    }
    else {
      return reject('Require user id');
    }
  });
}

function previewBooking (_params) {
  return new Promise((resolve, reject) => {
      var query = new Parse.Query("Booking");
      var bookingId = _params.id;
      var code      = _params.code;
      if (bookingId) {
        getBookingByParams({id: bookingId})
        .then(function (booking) {
            if (booking) {
              var status = booking.get('status');
              if (status === "CANCELED") {
                throw('Your booking has been canceled before');
              }
              if (status === "CLOSED") {
                throw('Your booking has been closed before');
              }
              if (status === "PENDING") {
                throw('Your booking is on waiting for approval');
              }
              return resolve(booking);
            }
            else {
              throw('No booking found');
            }
        })
        .catch(function (error) {
            return reject(error);
        });
      }
      else if (code) {
        getBookingByParams({code: code})
        .then(function (booking) {
            if (booking) {
              var status = booking.get('status');
              if (status === "CANCELED") {
                throw('Your booking has been canceled before');
              }
              if (status === "CLOSED") {
                throw('Your booking has been closed before');
              }
              if (status === "PENDING") {
                throw('Your booking is on waiting for approval');
              }
              return resolve(booking);
            }
            else {
              throw('No booking found');
            }
        })
        .catch(function (error) {
            return reject(error);
        });
      }
      else {
        return reject('Require booking id || code for preview booking');
      }
  });
}

function getUserBooking (_params) {
  return new Promise((resolve, reject) => {
      var query = new Parse.Query("Booking");
      var user = _params.user;
      if (user && user.id) {
        getBookingByParams({user: user, sortByTime: true, isHistory: false, isUserBooking: true})
        .then(function (bookings) {
            return resolve(bookings || []);
        })
        .catch(function (error) {
            return reject(error);
        });
      }
      else {
        return reject('Require user id');
      }
  });
}

function getBookingById (_params) {
  return new Promise((resolve, reject) => {
      var query = new Parse.Query("Booking");
      var booking = _params.booking;
      var checkinTime = _params.checkinTime;
      if (booking && booking.objectId) {
        query.equalTo("objectId", booking.objectId);
        query.first().then(function(bookingData) {
          if (bookingData) {
            bookingData.set('startTime', checkinTime);
            return bookingData.save(null)
          } else {
            return reject("No found booking to update");
          }
        })
        .then(function (saveResult) {
          return resolve(saveResult);
        })
        .catch(function (error) {
          return reject(error);
        })
      } else {
        return reject('Require booking id');
      }
  });
}

function getRecordByBookingId (_params) {
  return new Promise((resolve, reject) => {
      var query = new Parse.Query("Record");
      if (_params && _params.id) {
        query.equalTo("booking", { "__type": "Pointer", "className": "Booking", "objectId": _params.id });
        query.first().then(function(recordData) {
          if (recordData) {
            recordData.set('checkoutTime', moment().toDate());
            return recordData.save(null)
          } else {
            return reject("No found booking to update");
          }
        })
        .then(function (saveResult) {
          return resolve(saveResult);
        })
        .catch(function (error) {
          return reject(error);
        })
      } else {
        return reject('Require booking id');
      }
  });
}

exports.getRecordByBookingId = getRecordByBookingId;
exports.getBookingById = getBookingById;
exports.createNewBooking              = createNewBooking;
exports.createBookingForLoginUser     = createBookingForLoginUser;
exports.createBookingForAnonymousUser = createBookingForAnonymousUser;
exports.getBookingByParams            = getBookingByParams;
exports.getUserBooking                = getUserBooking;
exports.getLastValidUserBooking       = getLastValidUserBooking;
exports.previewBooking                = previewBooking;
