
var _        = require('underscore');
var moment   = require('moment');

var Constants       = require('./../constant.js');
var Tool            = require('./../utils/tools.js');
var DiscountModel   = require('./discountModel.js');
var PackageModel    = require('./packageModel.js');
var userModel       = require('./userModel');
var GlobalVariable  = require('./globalVariable.js');
var Mailgun = require('mailgun-js')({
    apiKey: process.env.EMAIL_API_KEY,
    domain: process.env.EMAIL_DOMAIN
});

function createBookingForLoginUser(_params) {
  return new Promise((resolve, reject) => {
      var packageId = _params.packageId;
      var user      = _params.user;
      if (packageId) {
        userModel.getUserWithId(user.id)
          .then((userData) => {
            user.username = userData.get('username');
            user.name = userData.get('name');
            return getLastValidUserBooking({user: user});
          })
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
          _params.hasCheckined = true;
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

function createBookingForLoginUserNoBooking(_params) {
  return new Promise((resolve, reject) => {
      var packageId = _params.packageId;
      var user      = _params.user;
      if (packageId) {
        userModel.getUserWithId(user.id)
          .then((userData) => {
            user.username = userData.get('username');
            user.name = userData.get('name');
            return getLastValidUserBooking({user: user});
          })
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
              return resolve(data);
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

function createNewBooking(_params, _code) {
  return new Promise((resolve, reject) => {
      var Booking = Parse.Object.extend("Booking");
      var booking = new Booking();

      booking.set("isPaid", false);
      booking.set("payAmount", 0);
      booking.set("discountAmount", 0);
      if (_params.hasCheckined)  {
        booking.set("hasCheckined", _params.hasCheckined);
      } else {
        booking.set("hasCheckined", false);
      }

      if (_code || _params.hasCheckined) {
        booking.set("status", Constants.BOOKING_STATUSES[2]);
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

      if (_params.paymentMethod) {
        booking.set("paymentMethod", _params.paymentMethod);
      }

      if(!_.isNull(_params.hasCheckined) && !_.isUndefined(_params.hasCheckined))
        booking.set("hasCheckined", _params.hasCheckined);

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
        query.containedIn("status", ["CLOSED", "IN PROGRESS", "PENDING"]);
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

function updateRecordByBookingId (_params) {
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

function unCheckoutRecord(_params) {
  return new Promise((resolve, reject) => {
    var recordQuery = new Parse.Query("Record");
    recordQuery.equalTo("objectId", _params.objectId);
    recordQuery.include('booking')
    recordQuery.first().then(function(recordData) {
      if (recordData) {
        var booking = recordData.get("booking");
        booking.set("status", "IN PROGRESS");
        recordData.set("checkoutTime", null);
        return recordData.save(null)
      } else {
        return reject("No found record to update");
      }
    })
    .then(function (recordResult) {
      return resolve(recordResult);
    })
    .catch(function (error) {
      return reject(error);
    })
  });
}

function updateBookingAndCheckingTable(_params) {
  return new Promise((resolve, reject) => {
    var recordQuery = new Parse.Query("Record");
    var bookingQuery = new Parse.Query("Booking");
    if (_params && _params.bookingId) {
      bookingQuery.equalTo("objectId", _params.bookingId);
      bookingQuery.first().then(function(bookingData) {
        if (bookingData) {
          if (_params.calculatedPrice > 0 || _params.calculatedPrice === 0) {
            bookingData.set('calculatedPrice', _params.calculatedPrice);
          }
          if (_params.bookingPackage) {
            bookingData.set('package', _params.bookingPackage);
          }
          if (_params.numOfUsers) {
            bookingData.set('numOfUsers', _params.numOfUsers);
          }
          if (_params.paymentMethod) {
            bookingData.set('paymentMethod', _params.paymentMethod);
          }
          if (_params.discountAmount > 0 || _params.discountAmount === 0) {
            bookingData.set('discountAmount', _params.discountAmount);
          }
          if (_params.status) {
            bookingData.set('status', _params.status);
          }
          if (_params.downPayment > 0 || _params.downPayment === 0) {
            bookingData.set('downPayment', _params.downPayment);
          }
          if (_params.user) {
            bookingData.set('user', _params.user);
          }
          if (_params.isPaid) {
            bookingData.set('isPaid', _params.isPaid);
          }
          return bookingData.save(null)
        } else {
          return reject("No found booking to update");
        }
      })
      .then(function (saveBooking) {
        if (_params && _params.recordId) {
            recordQuery.equalTo("objectId", _params.recordId);
            recordQuery.first().then(function(recordData) {
              if (recordData) {
                if (_params && _params.checkoutByAdmin) {
                  recordData.set('checkoutByAdmin', _params.checkoutByAdmin);
                }
                if (_params && _params.username) {
                  recordData.set('username', _params.username);
                  recordData.set('name', _params.username);
                }
                if (_params && _params.userId) {
                  recordData.set('userId', _params.userId);
                }
                if (_params && _params.checkinTime) {
                  recordData.set('checkinTime', moment(_params.checkinTime).toDate());
                }
                if (_params && _params.checkoutTime) {
                  recordData.set('checkoutTime', moment(_params.checkoutTime).toDate());
                }
                return recordData.save(null)
              } else {
                return reject("No found record to update");
              }
            })
            .then(function (recordResult) {
              return resolve({booking: saveBooking, record: recordResult});
            })
            .catch(function (error) {
              return reject(error);
            })
        } else {
          return resolve({booking: saveBooking});
        }
      })
      .catch(function (error) {
        return reject(error);
      })
    } else {
      return reject('Require booking id');
    }
  });
}

function getAllBookingsForVisitorManagement (){
  return new Promise((resolve, reject) => {
    var query = new Parse.Query("Booking");
    query.equalTo('hasCheckined', false)
      .descending('startTime')
      .find().then((data) => {
      return resolve(data);
    }).catch((err) => {
      return reject(err);
    });
  });
}

function searchBookingsForVisitorManagement (params){
  return new Promise((resolve, reject) => {
    var query = new Parse.Query("Booking");
    if (params.visitorName)
      query.startsWith('user.name', params.visitorName);
    if (params.packageId)
      query.equalTo('package.objectId', params.packageId);
    if (params.bookingStatus)
      query.equalTo('status', params.bookingStatus);
    if (params.paymentMethod)
      query.equalTo('paymentMethod', params.paymentMethod);
    if (params.startTime && params.endTime){
      if(new moment(params.startTime).isBefore(new moment(params.endTime))){
        query.greaterThanOrEqualTo('startTime', new Date(params.startTime))
          .lessThanOrEqualTo('startTime', new Date(params.endTime));
      }else{
        return reject('Please start time must be before end time!');
      }
    }else{
      if((!params.startTime && params.endTime) || (!params.endTime && params.startTime)){
        return reject('Please select start time and end time!');
      }
    }

    query.equalTo('hasCheckined', false)
      .descending('startTime')
      .find().then((data) => {
      return resolve(data);
    }).catch((err) => {
      return reject(err);
    });
  });
}

function changeStatusBooking(params) {
  return new Promise((resolve, reject) => {
    if(!params.bookingId) return reject("Missing bookingId");

    var bookingQuery = new Parse.Query("Booking");
    bookingQuery.equalTo("objectId", params.bookingId);
    bookingQuery.first().then(function(bookingData) {
      if (bookingData) {
        if(!_.isNull(params.hasCheckined) && !_.isUndefined(params.hasCheckined))
          bookingData.set("hasCheckined", params.hasCheckined);

        bookingData.set('status', params.status);
        return resolve(bookingData.save(null))
      } else {
        return reject("No found booking to update");
      }
    }).catch((error) => {
      return reject(error);
    })
  });
}

function sendMail (email_to, email_from, subject, html) {
  return new Promise((resolve, reject) => {
    Mailgun.messages().send({
      to: email_to,
      from: email_from,
      subject: subject,
      html: html,
    })
    .then((data) => {
      return resolve(data)
    })
    .catch((error) => {
      return reject(error)
    })
  });
}
exports.createBookingForLoginUserNoBooking = createBookingForLoginUserNoBooking;
exports.updateBookingAndCheckingTable = updateBookingAndCheckingTable;
exports.updateRecordByBookingId       = updateRecordByBookingId;
exports.createNewBooking              = createNewBooking;
exports.createBookingForLoginUser     = createBookingForLoginUser;
exports.createBookingForAnonymousUser = createBookingForAnonymousUser;
exports.getBookingByParams            = getBookingByParams;
exports.getUserBooking                = getUserBooking;
exports.getLastValidUserBooking       = getLastValidUserBooking;
exports.previewBooking                = previewBooking;
exports.sendMail                      = sendMail;
exports.unCheckoutRecord              = unCheckoutRecord;
exports.getAllBookingsForVisitorManagement       = getAllBookingsForVisitorManagement;
exports.searchBookingsForVisitorManagement       = searchBookingsForVisitorManagement;
exports.changeStatusBooking                      = changeStatusBooking;
