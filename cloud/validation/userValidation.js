var _       = require('underscore');
var moment = require('moment');

Parse.Cloud.beforeSave("_User", function(req, res) {
  var username = req.object.get('username');
  var re = /^[a-zA-Z0-9_.-]*$/;
  var isValid = re.test(username);

  if (!isValid) {
     return res.error('invalid username');
  }

  return res.success()
});
