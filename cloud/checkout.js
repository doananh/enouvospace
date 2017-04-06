var _ = require('underscore');
var moments = require('moment');

var PriceCalculatingModel = require('./models/priceCalculatingModel.js');
var BookingModel          = require('./models/bookingModel.js');
var CheckoutModel         = require('./models/checkoutModel.js');

Parse.Cloud.define("checkoutByCode", function(req, res) {
  var params = req.params;
  if (params && params.code) {
      BookingModel.getBookingByParams({code: params.code})
      .then(function (bookingData) {
          return PriceCalculatingModel.getBookingPricingDetail(bookingData)
      })
      .then(function(priceDetail) {
          return CheckoutModel.formatResponseData(priceDetail)
      })
      .then( function (formatData) {
          var packageObject = {
            name: formatData.package.name,
            type: formatData.package.type,
            chargeRate: formatData.package.chargeRate.value,
            objectId: formatData.package.id
          }
          var bookingQuery = new Parse.Query('Booking');
          bookingQuery.get(formatData.bookingId).then( function (booking) {
            booking.set("payAmount", formatData.totalPrice.value);
            booking.set("packageCount", formatData.package.count);
            booking.set("numOfUsers", formatData.numOfUsers);
            booking.set("discountAmount", formatData.discountAmount.value);
            booking.set("serviceAmount", formatData.serviceAmount.value);
            booking.set("package", packageObject);
            booking.set("startTime", formatData.checkinTime);
            booking.set("endTime", formatData.checkoutTime);
            booking.set("status", "CLOSED");
            booking.set("user", formatData.user);
            return booking.save();
          })
          .then ( function (saveResult) {
            return res.success(formatData);
          }, function (error) {
            return res.error(error);
          });
      })
      .catch( function (error) {
          return res.error(error);
      });
  }
  else {
    res.error('Require code params for checking out');
  }
});

Parse.Cloud.define("checkoutByBookingId", function(req, res) {
  var params = req.params;
  if (params && params.bookingId) {
    BookingModel.closeBookingWithParams({bookingId: params.bookingId})
    .then(function (bookingData) {
        return PriceCalculatingModel.getBookingPricingDetail(bookingData)
    })
    .then(function(priceDetail) {
        return CheckoutModel.formatResponseData(priceDetail)
    })
    .then( function (formatData) {
        return res.success(formatData);
    })
    .catch( function (error) {
        return res.error(error);
    });
  }
  else {
    return res.error('Require bookingId params for checking out');
  }
});
