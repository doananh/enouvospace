
var _        = require('underscore');
var moment   = require('moment');

var Constants = require('./../constant.js');
var Tool      = require('./../utils/tools.js');

var PriceCalculatingModel = require('./priceCalculatingModel.js');
var BookingModel          = require('./bookingModel.js');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

function recordCheckin (_params) {
  return new Promise( (resolve, reject) => {
    var checkinTime = _params.checkinTime ?  _params.checkinTime : moment().toDate();
    var username    = _params.username;
    var userId      = _params.userId;
    var bookingId   = _params.bookingId;
    var code        = _params.code;
    var Record = Parse.Object.extend("Record");
    var record = new Record();
    record.set("checkinTime", checkinTime);
    record.set("username", username);
    record.set("userId", userId);
    record.set("booking", { "__type":"Pointer","className":"Booking","objectId":bookingId });
    record.save().then( function (data) {
      var checkinTime = data.get('checkinTime');
      var booking     = data.get('booking');
      return resolve({
        checkinTime: checkinTime.toISOString(),
        objectId: data.id,
        user: {
          userId: data.get('userId'),
          username: data.get('username'),
          code: code
        },
        bookingId: booking.objectId
      });
    })
    .catch ( function (error) {
      return reject(error);
    });
  });
}

function recordCheckout (_params) {
    return new Promise( (resolve, reject) => {
        var checkoutTime  = moment().toDate();
        var username      = _params.username;
        var userId        = _params.userId;
        var bookingId     = _params.bookingId;

        var recordQuery   = new Parse.Query("Record");
        recordQuery.descending("createdAt");
        if (username) {
          recordQuery.equalTo("username", username);
        }
        if (userId) {
          recordQuery.equalTo("userId", userId);
        }
        if (bookingId) {
          recordQuery.equalTo("booking", { "__type":"Pointer","className":"Booking","objectId":bookingId });
        }

        recordQuery.first()
        .then( function (recordData) {
            if (recordData) {
              recordData.set("checkoutTime", checkoutTime);
              return recordData.save();
            }
            else {
              throw('No record found to checkout');
            }
        })
        .then( function (recordData) {
            var recordObject = {
              objectId: recordData.id,
              checkinTime: recordData.get('checkinTime'),
              checkoutTime: recordData.get('checkoutTime'),
              bookingId: recordData.get('booking').id
            };
            return resolve(recordObject);
        })
        .catch( function (error) {
            return reject(error);
        });
    });
}

function recordCheckoutAndPreviewBooking (_params) {
  return new Promise( (resolve, reject) => {
      BookingModel.getBookingByParams(_params)
      .then( function (bookingData) {
          if (bookingData) {
            var data = { userId: _params.userId, username: _params.username };
            return Parse.Promise.when([
              recordCheckout(data),
              PriceCalculatingModel.previewPricing(bookingData)
            ]);
          }
          else {
            throw('Please create booking first');
          }
      })
      .then( function (results) {
          var recordObject = results[0];
          var priceDetailData = results[1];
          priceDetailData.latestRecord = recordObject;
          priceDetailData.isPreviewBooking = true;
          return resolve(priceDetailData);
      })
      .catch( function (error) {
          return reject(error);
      });
  });
}

function getRecordByParams (_params) {
  return new Promise( (resolve, reject) => {
    var bookingId = _params.bookingId;
    var query = new Parse.Query("Record");
    if (bookingId) {
      query.equalTo("booking", { "__type":"Pointer","className":"Booking","objectId":bookingId });
    }
    else {
      return reject('getRecord: require booking id params');
    }

    query.first()
    .then(function (recordData) {
        return resolve(recordData);
    })
    .catch(function (error){
        return reject(error);
    });
  });
}

exports.getRecordByParams = getRecordByParams;
exports.recordCheckin   = recordCheckin;
exports.recordCheckout  = recordCheckout;
exports.recordCheckoutAndPreviewBooking = recordCheckoutAndPreviewBooking;
