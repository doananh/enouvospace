var _     = require('underscore');
var Tool  = require('./utils/tools');
var PriceCalculatingUtil = require('./models/priceCalculatingModel');

Parse.Cloud.define('getPricingDetail', function(req, res) {
  var params    = req.params;
  var UserId    = params.UserId;
  var BookingId = params.BookingId; //"exxTso1mFU"
  /* 2 cases
    1. for anonymous - standard package hour
    2. *** for users - by package HOUR - DAY - WEEK - MONTH
       => require bookingId
       => return detail pricing
  */
  if (BookingId) {
    var bookingQuery = new Parse.Query('Booking');
    bookingQuery.equalTo('objectId', BookingId); //BookingId
    bookingQuery.include('package');
    bookingQuery.include('discount');
    bookingQuery.first().then(function(booking) {
      PriceCalculatingUtil.getBookingPricingDetail(booking)
        .then(function(result) {
          return res.success(result);
        })
    }, function (error) {
      return res.error(err);
    });
  }
  else {
    return res.success({});
  }
});
