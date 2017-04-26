var _ = require('underscore');

Parse.Cloud.beforeSave("Package", function(req, res) {
  var chargeRate  = req.object.get('chargeRate');
  var name        = req.object.get('name');

  if (_.isUndefined(name) || _.isNull(name)) {
    res.error('Required type params');
  }
  else if (name && !_.isString(name)) {
    res.error('Invalid type format');
  }
  else if (!_.isNumber(chargeRate) || (chargeRate < 0)) {
    res.error('Required chargeRate params');
  }
  else {
    res.success();
  }
});
