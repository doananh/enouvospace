var _ = require('underscore');
var moments = require('moment');

Parse.Cloud.beforeSave("GlobalVariable", function(req, res) {
  return res.success({});
});
