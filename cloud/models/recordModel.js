
var _        = require('underscore');
var moment   = require('moment');

var Constants = require('./../constant.js');
var Tool      = require('./../utils/tools.js');

var PriceCalculatingModel = require('./priceCalculatingModel.js');
var BookingModel          = require('./bookingModel.js');
var CheckoutModel         = require('./checkoutModel.js');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

function recordCheckin (_params) {
  return new Promise( (resolve, reject) => {
    var checkinTime = moment().toDate();
    var username    = _params.username;
    var userId      = _params.userId;
    var bookingId   = _params.bookingId;

    var Record = Parse.Object.extend("Record");
    var record = new Record();

    record.set("checkinTime", checkinTime);
    record.set("username", username);
    record.set("userId", userId);
    record.set("booking", { "__type":"Pointer","className":"Booking","objectId":bookingId });
    record.save().then( function (data) {
      var checkinTime = data.get('checkinTime');
      return resolve({
        checkinTime: checkinTime.toISOString(),
        objectId: data.id,
        user: {
          userId: data.get('userId'),
          username: data.get('username')
        }
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

    var recordQuery   = new Parse.Query("Record");
    recordQuery.descending("createdAt");
    recordQuery.equalTo("username", username);
    recordQuery.equalTo("userId", userId);

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
        return resolve({checkoutTime: checkoutTime});
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
              PriceCalculatingModel.getBookingPricingDetail(bookingData)
            ]);
          }
          else {
            throw('Please create booking first');
          }
      })
      .then( function (results) {
          return CheckoutModel.formatResponseData(results[1]);
      })
      .then( function (formatData) {
          return resolve(formatData);
      })
      .catch( function (error) {
          return reject(error);
      });
  });
}

exports.recordCheckin   = recordCheckin;
exports.recordCheckout  = recordCheckout;
exports.recordCheckoutAndPreviewBooking = recordCheckoutAndPreviewBooking;
