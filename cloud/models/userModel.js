var _ = require('underscore');

function getUserWithBusiness (_businessData) {
  var userQuery = new Parse.Query("User");
  userQuery.equalTo("business", { "__type": "Pointer", "className": "Business", "objectId": _businessData.objectId });
  userQuery.include("business");
  return userQuery.find();
}

function getUserWithId (_id) {
  var userQuery = new Parse.Query("User");
  return userQuery.get(_id, { useMasterKey: true });
}

exports.getUserWithBusiness   = getUserWithBusiness;
exports.getUserWithId = getUserWithId;