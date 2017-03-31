var _ = require('underscore');
var moments = require('moment');

var PriceCalculatingModel = require('./models/priceCalculatingModel.js');
var BookingModel          = require('./models/bookingModel.js');
var CheckoutModel         = require('./models/checkoutModel.js');

Parse.Cloud.define("checkoutByCode", function(req, res) {
  var params = req.params;
  if (params && params.code) {
      BookingModel.closeBookingWithParams({code: params.code})
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
