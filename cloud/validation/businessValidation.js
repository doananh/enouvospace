var _ = require('underscore');
var moments = require('moment');

Parse.Cloud.beforeSave("Business", function(req, res) {
  return res.success({});
});
