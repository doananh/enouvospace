var _ = require('underscore');
var moments = require('moment');

Parse.Cloud.beforeSave("Service", function(req, res) {
  var booking         = req.object.get('booking');
  var servicePackage  = req.object.get('servicePackage');
  var amount          = req.object.get('amount');
  var count           = req.object.get('count');
  var isPaid          = req.object.get('isPaid');

  if (isPaid && ((amount <= 0) || _.isUndefined(amount) || _.isNull(amount))) {
    return res.error('Should update amount after updating paid field');
  }

  if (amount && (amount < 0)) {
    return res.error()
  }

  return res.success({});
});
