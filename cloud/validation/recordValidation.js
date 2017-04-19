
var _       = require('underscore');
var moment = require('moment');

var Constants = require('./../constant.js');

Parse.Cloud.beforeSave("Record", function(req, res) {
  var username      = req.object.get('username');
  var userId        = req.object.get('userId');
  var checkinTime   = req.object.get('checkinTime');
  var checkoutTime  = req.object.get('checkoutTime');
  var booking       = req.object.get('booking');

  if (_.isNull(checkinTime) || _.isUndefined(checkinTime)) {
    return res.error('Require checkin time params');
  }

  if (!_.isString(username) || !username.length) {
    return res.error('Require username param');
  }

  if (booking) {
    /* valid something later */
  }
  else {
    return res.error('Require booking param');
  }

  return res.success();
});
