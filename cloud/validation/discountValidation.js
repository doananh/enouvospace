var _ = require('underscore');
var moments = require('moment');

Parse.Cloud.beforeSave("Discount", function(req, res) {
  res.success({});
});
