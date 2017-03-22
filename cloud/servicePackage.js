var _ = require('underscore');
var moments = require('moment');
var Tool = require('./utils/tools');

Parse.Cloud.beforeSave("ServicePackage", function(req, res) {
  res.success({});
});
