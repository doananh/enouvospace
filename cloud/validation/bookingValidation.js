
var _ = require('underscore');
var Constants = require('./../constant.js');

Parse.Cloud.beforeSave("Booking", function(req, res) {
  var user          = req.object.get('user');
  var packageCount  = req.object.get('packageCount');
  var pPackage      = req.object.get('package');
  var numOfUsers    = req.object.get('numOfUsers');
  var startTime     = req.object.get('startTime');
  var status        = req.object.get('status');

  if (_.isUndefined(user) || _.isEmpty(user)) {
    return res.error('Require user params');
  }

  if (user && !user.code && !user.id) {
    return res.error('Require code or id in user params');
  }

  if (user && user.code && user.id) {
    return res.error('only code or only id in user params');
  }

  if (user && user.id && !user.username) {
    return res.error('Require username in user');
  }

  if (user && user.code && (!_.isString(user.code) || (user.code.length < 4))) {
    return res.error('Invalid code format');
  }

  if (user && user.code && !user.username) {
    return res.error('Require username in user')
  }

  if ( _.isUndefined(packageCount) || _.isNull(packageCount) || (packageCount < 0)) {
    return res.error('invalid number of package');
  }

  if (!pPackage) {
    res.error('Require package params');
  }

  if (!_.isDate(startTime)) {
    return res.error('Require start time params');
  }

  if (!_.isNumber(numOfUsers) || (numOfUsers <= 0)) {
    return res.error('Require number of users params');
  }

  if (Constants.BOOKING_STATUSES.indexOf(status) < 0) {
    return res.error('Invalid status - please change it to OPEN or PENDING or CLOSED');
  }

  if (status === "OPEN" && req.object.id) {
    var preStatus     = req.original.get('status');
    if (preStatus === "CLOSED") {
      return res.error('Cannot open the closed booking')
    }
  }

  return res.success();
});
