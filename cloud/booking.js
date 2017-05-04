var _ = require('underscore');
var moments = require('moment');

var PriceCalculatingModel = require('./models/priceCalculatingModel.js');
var BookingModel          = require('./models/bookingModel.js');
var CheckoutModel         = require('./models/checkoutModel.js');

Parse.Cloud.define("previewBooking", function(req, res) {
  var params = req.params;
  BookingModel.getBookingByParams(params)
  .then(function (bookingData) {
      return PriceCalculatingModel.getBookingPricingDetail(bookingData);
  })
  .then( function (formatData) {
      return res.success(formatData);
  })
  .catch( function (error) {
      return res.error(error);
  });
});

Parse.Cloud.define("loadUserBooking", function(req, res) {
  var params = req.params;
  BookingModel.getUserBooking(params)
  .then( function (data) {
    var jsonData = _.map(data, function(element){ return element.toJSON()});
    return res.success(jsonData);
  })
  .catch( function (error) {
    return res.error(error);
  });
});

Parse.Cloud.define("getLastValidUserBooking", function(req, res) {
  var params = req.params;
  if (params.user && params.user.id) {
    BookingModel.getLastValidUserBooking({userId: params.user.id})
    .then( function (bookingData) {
      if (bookingData) {
        return res.success(bookingData.toJSON());
      }
      else {
        throw('No booking found. Please contact reception to booking a new one.')
      }

    })
    .catch( function (error) {
      return res.error(error);
    });
  }
  else if (params.user && !params.user.id) {
    return res.error('Require user id params');
  }
  else {
    return res.error('Require user params');
  }
});
