var _ = require('underscore');
var moments = require('moment');
var Tool = require('./utils/tools.js');
var BookingModel = require('./models/bookingModel.js');
var RecordModel   = require('./models/recordModel.js');

Parse.Cloud.define("checkin", function(req, res) {
  var params = req.params;
  var user   = params.user;
  if (user && user.id && user.username) {
    BookingModel.createBookingForLoginUser(params)
    .then(function (bookingData) {
        return res.success(bookingData);
    })
    .catch(function (error) {
        return res.error(error);
    });
  }
  else if (params.user && (!params.user.id || !params.user.username)) {
    return res.error('Require id and username params for creating booking');
  }
  else {
    BookingModel.createBookingForAnonymousUser(params)
    .then(function (bookingData) {
        return RecordModel.recordCheckin(bookingData, params);
    })
    .then(function (recordData) {
        return res.success(recordData);
    })
    .catch(function (error) {
        return res.error(error);
    });
  }
});
