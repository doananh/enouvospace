var _ = require('underscore');
var moments = require('moment');

var PriceCalculatingModel = require('./models/priceCalculatingModel.js');
var BookingModel          = require('./models/bookingModel.js');
var RecordModel           = require('./models/recordModel.js');

Parse.Cloud.define("checkoutByCode", function(req, res) {
  var params = req.params;
  if (params && params.code) {
    BookingModel.getBookingByParams({code: params.code})
    .then(function (bookingObject) {
        return PriceCalculatingModel.calculateBookingPricing(bookingObject)
        .then(function (data) {
            bookingObject.set("payAmount", data.payAmount);
            bookingObject.set("packageCount", data.packageCount);
            bookingObject.set("numOfUsers", data.numOfUsers);
            bookingObject.set("discountAmount", data.discountPricing.total);
            bookingObject.set("serviceAmount", data.servicePricing.total);
            bookingObject.set("package", data.packagePricing.package);
            bookingObject.set("startTime", data.startTime);
            bookingObject.set("endTime", data.endTime);
            bookingObject.set("status", "CLOSED");
            bookingObject.set("user", data.user);
            return bookingObject.save();
        })
        .catch(function (error) {
            return res.error(error);
        });
        /// temp write as a callback promise - will change later
    })
    .then(function (bookingSaveResult) {
        var recordParams = {
          bookingId: bookingSaveResult.id,
          username: bookingSaveResult.get('user').username
        }
        return RecordModel.recordCheckout(recordParams)
    })
    .then(function (recordData) {
        return res.success(recordData);
    })
    .catch(function (error) {
        return res.error(error);
    });
  }
  else {
    return res.error('Require code params for checking out');
  }
});

Parse.Cloud.define("checkoutByBookingId", function(req, res) {
  var params = req.params;

  if (params && params.bookingId) {
    BookingModel.getBookingByParams({bookingId: params.bookingId})
    .then(function (bookingObject) {
        return PriceCalculatingModel.calculateBookingPricing(bookingObject)
        .then(function (data) {
            bookingObject.set("payAmount", data.payAmount);
            bookingObject.set("packageCount", data.packageCount);
            bookingObject.set("numOfUsers", data.numOfUsers);
            bookingObject.set("discountAmount", data.discountPricing.total);
            bookingObject.set("serviceAmount", data.servicePricing.total);
            bookingObject.set("package", data.packagePricing.package);
            bookingObject.set("startTime", data.startTime);
            bookingObject.set("endTime", data.endTime);
            bookingObject.set("status", "CLOSED");
            bookingObject.set("user", data.user);
            return bookingObject.save();
        })
        .catch(function (error) {
            return res.error(error);
        });
        /// temp write as a callback promise - will change later
    })
    .then(function (bookingSaveResult) {
          RecordModel.getRecordByParams({bookingId: bookingSaveResult.id})
          .then(function (recordData) {
              if (recordData) {
                var recordParams = {
                  bookingId: bookingSaveResult.id,
                  username: bookingSaveResult.get('user').username,
                  userId: bookingSaveResult.get('user').id
                }
                return RecordModel.recordCheckout(recordParams)
              }
              else {
                return {};
              }
          });
          //temp fix as callback promise - will change later
    })
    .then(function (recordData) {
        return res.success(recordData);
    })
    .catch(function (error) {
        return res.error(error);
    });
  }
  else {
    return res.error('Require bookingId params for checking out');
  }
});
