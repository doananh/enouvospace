var _ = require('underscore');

Parse.Cloud.beforeSave("Booking", function(req, res) {
  var user          = req.object.get('user');
  var code          = req.object.get('code');
  var packageCount  = req.object.get('packageCount');
  var pPackage      = req.object.get('package');
  var numOfUsers    = req.object.get('numOfUsers');
  var startTime     = req.object.get('startTime');
  if ((_.isUndefined(user) || _.isEmpty(user))
    && (_.isUndefined(code) || _.isNull(code)))
  {
    res.error('Required user or code params');
  }
  else if (code && (!_.isString(code) || (code.length < 4))) {
    res.error('Invalid code format');
  }
  else if (user && _.isObject(user) && !_.isString(user.id)) {
    res.error('Invalid user');
  }
  else if (!_.isNumber(packageCount) || (packageCount <= 0)) {
    res.error('invalid number of package');
  }
  else if (!pPackage) {
    res.error('Required package params');
  }
  else if (!_.isDate(startTime)) {
    res.error('Required start time params');
  }
  else if (!_.isNumber(numOfUsers) || (numOfUsers <= 0)) {
    res.error('Required number of users params');
  }
  else {
    res.success();
  }
});
