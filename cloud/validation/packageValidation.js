var _ = require('underscore');
var moments = require('moment');

Parse.Cloud.beforeSave("Package", function(req, res) {
  res.success({});
});
