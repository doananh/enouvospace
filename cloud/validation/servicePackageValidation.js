var _ = require('underscore');
var moments = require('moment');

Parse.Cloud.beforeSave("ServicePackage", function(req, res) {
  return res.success({});
});
