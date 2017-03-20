var _ = require('underscore');

Parse.Cloud.beforeSave("Booking", function(req, res) {
  var user          = req.object.get('user');
  var packageCount  = req.object.get('packageCount');
  var pPackage      = req.object.get('package');
  var numOfUsers    = req.object.get('numOfUsers');
  var startTime     = req.object.get('startTime');
  if (_.isUndefined(user) || _.isEmpty(user))
  {
    res.error('Require user params');
  }
  else if (user && user.id && !user.username) {
    res.error('Require username in user');
  }
  else if (user && user.code && (!_.isString(user.code) || (user.code.length < 4))) {
    res.error('Invalid code format');
  }
  else if (user && user.code && !user.username) {
    res.error('Require username in user')
  }
  else if (!_.isNumber(packageCount) || (packageCount <= 0)) {
    res.error('invalid number of package');
  }
  else if (!pPackage) {
    res.error('Require package params');
  }
  else if (!_.isDate(startTime)) {
    res.error('Require start time params');
  }
  else if (!_.isNumber(numOfUsers) || (numOfUsers <= 0)) {
    res.error('Require number of users params');
  }
  else {
    res.success();
  }
});
