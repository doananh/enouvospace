var _ = require('underscore');

Parse.Cloud.beforeSave("Package", function(req, res) {
  var type        = req.object.get('type');
  var chargeRate  = req.object.get('chargeRate');
  var name        = req.object.get('name');

  if (_.isUndefined(type) || _.isNull(type)) {
    res.error('Required type params');
  }
  else if (type && !_.isString(type)) {
    res.error('Invalid type format');
  }
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
