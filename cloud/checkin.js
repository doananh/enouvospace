var _ = require('underscore');
var moments = require('moment');
var Tool = require('./util/Tool');
var BookingUtil = require('./util/BookingUtil');

Parse.Cloud.define("checkin", function(req, res) {
  var params = req.params;
  if (params.UserId !== null) {
    BookingUtil.createBookingForLoginUser(params, res)
    .then(function (data) {
      return res.success({ status: 'checkin success'});
    }, function (error) {
      return res.error(error);
    });
  } else {
    BookingUtil.createBookingForAnonymousUser(params, res);
  }
});
