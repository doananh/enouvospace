var _ = require('underscore');
var moments = require('moment');

var PriceCalculatingModel = require('./models/priceCalculatingModel');
var BookingModel          = require('./models/bookingModel');
var CheckoutModel         = require('./models/checkoutModel');

Parse.Cloud.define("checkoutByCode", function(req, res) {
  var params = req.params;
  if (params && params.code) {
    BookingModel.getBookingByCode(params.code)
    .then(function (bookingData) {
        PriceCalculatingModel.getBookingPricingDetail(bookingData)
        .then(function(priceDetail) {
            CheckoutModel.formatResponseData(priceDetail)
            .then( function (formatData) {
                res.success(formatData);
            }, function (formatDataError) {
                res.error(formatDataError);
            });
        });
    }, function (getBookingError) {
      res.error(getBookingError);
    });
  }
  else {
    res.error('Require code params for checking out');
  }
});

Parse.Cloud.define("checkoutByBookingId", function(req, res) {
  var params = req.params;
  if (params && params.bookingId) {
    BookingModel.getBookingById(params.bookingId)
    .then(function (bookingData) {
        PriceCalculatingModel.getBookingPricingDetail(bookingData)
        .then(function(priceDetail) {
            CheckoutModel.formatResponseData(priceDetail)
            .then( function (formatData) {
                res.success(formatData);
            }, function (formatDataError) {
                res.error(formatDataError);
            });
        });
    }, function (getBookingError) {
      res.error(getBookingError);
    });
  }
  else {
    res.error('Require bookingId params for checking out');
  }
});
