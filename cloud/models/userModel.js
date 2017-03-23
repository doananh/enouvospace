var _ = require('underscore');

function getUserWithBusiness (_businessData) {
  var userQuery = new Parse.Query("User");
  userQuery.equalTo("business", { "__type": "Pointer", "className": "Business", "objectId": _businessData.objectId });
  userQuery.include("business");
  return userQuery.find();
}

exports.getUserWithBusiness   = getUserWithBusiness;
