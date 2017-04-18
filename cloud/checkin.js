var _ = require('underscore');
var moments = require('moment');
var Tool = require('./utils/tools.js');
var BookingUtil = require('./models/bookingModel.js');

Parse.Cloud.define("checkin", function(req, res) {
  var params = req.params;
  if (params.user && params.user.id && params.user.username) {
    BookingUtil.createBookingForLoginUser(params)
    .then(function (data) {
      return res.success(data);
    }, function (error) {
      return res.error(error);
    });
  }
  else if (params.user && (!params.user.id || !params.user.username)) {
    return res.error('Require id and username params for check in user');
  }
  else {
    BookingUtil.createBookingForAnonymousUser(params)
    .then(function (data) {
      return res.success(data);
    }, function (error) {
      return res.error(error);
    });
  }
});
