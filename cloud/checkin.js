var _ = require('underscore');
var moments = require('moment');
var Tool = require('./utils/tools.js');
var BookingModel = require('./models/bookingModel.js');
var RecordModel   = require('./models/recordModel.js');

Parse.Cloud.define("checkin", function(req, res) {
  var params = req.params;
  if (params.user && params.user.id && params.user.username) {
    BookingModel.createBookingForLoginUser(params)
    .then(function (data) {
      return res.success(data);
    })
    .catch(function (error) {
      return res.error(error);
    });
  }
  else if (params.user && (!params.user.id || !params.user.username)) {
    return res.error('Require id and username params for check in user');
  }
  else {
    BookingModel.createBookingForAnonymousUser(params)
    .then(function (checkinData) {
      return RecordModel.recordCheckin(checkinData);
    })
    .then(function (recordData) {
      return res.success(recordData);
    })
    .catch(function (error) {
      return res.error(error);
    });
  }
});
