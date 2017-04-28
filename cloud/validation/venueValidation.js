var _ = require('underscore');
var moments = require('moment');

Parse.Cloud.beforeSave("Venue", function(req, res) {
  return res.success({});
});
