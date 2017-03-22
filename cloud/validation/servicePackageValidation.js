var _ = require('underscore');
var moments = require('moment');

Parse.Cloud.beforeSave("ServicePackage", function(req, res) {

  res.success({});
});
