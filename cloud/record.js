var _ = require('underscore');
var moments = require('moment');

var BookingModel  = require('./models/bookingModel.js');
var RecordModel   = require('./models/recordModel.js');

Parse.Cloud.define("recordCheckin", function(req, res) {
  var params    = req.params;
  var userId    = params.userId;
  var username  = params.username;
  BookingModel.getBookingByParams(params)
  .then(function (bookingData) {
      if (bookingData) {
        var data = { userId: userId, username: username, bookingId: bookingData.id };
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
  BookingModel.getBookingByParams(params)
  .then(function (bookingData) {
      if (bookingData) {
        var data = { userId: userId, username: username, bookingId: bookingData.id };
        return RecordModel.recordCheckout(data);
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
