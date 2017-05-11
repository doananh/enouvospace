var _ = require('underscore');
var moment = require('moment');

var BookingModel  = require('./models/bookingModel.js');
var RecordModel   = require('./models/recordModel.js');

Parse.Cloud.define("recordCheckin", function(req, res) {
  var params    = req.params;
  var userId    = params.userId;
  var username  = params.username;
  BookingModel.getBookingByParams({ userId: userId, username: username, status: "OPEN", latest: true })
  .then(function (bookingData) {
      if (bookingData) {
        var startTime       = bookingData.get('startTime');
        var packageObject   = bookingData.get('package');
        var willPayWhenCheckout     = packageObject.willPayWhenCheckout;
        if (willPayWhenCheckout && moment().isBefore(startTime)) {
          throw('Checkin time doesn\'t match with booking time');
        }
        else {
           ////
        }
        var data = { userId: userId, username: username, bookingId: bookingData.id};
        return RecordModel.recordCheckin(data)
      }
      else {
        throw('Please create booking first');
      }
  })
  .then( function (data) {
      return res.success(data);
  })
  .catch( function (error) {
      return res.error(error);
  });
});

Parse.Cloud.define("recordCheckout", function(req, res) {
  var params    = req.params;
  var userId    = params.userId;
  var username  = params.username;
  var bookingId = params.bookingId;

  BookingModel.getBookingByParams({ bookingId: bookingId, status: "OPEN" })
    .then(function(bookingInfo) {
      var bookingInfoToJSON = bookingInfo.toJSON();
      if(bookingInfoToJSON.package && bookingInfoToJSON.package.willPayWhenCheckout) {
        return RecordModel.recordCheckoutAndPreviewBooking({ username: username, userId: userId, bookingId: bookingId, status: "OPEN" });
      } else {
        return RecordModel.recordCheckout({ username: username, userId: userId });
      }
    })
    .then(function(data) {
      return res.success(data);
    })
    .catch( function (error) {
      return res.error(error);
    });
});
