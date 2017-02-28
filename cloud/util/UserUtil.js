var _ = require('underscore');

function getOwnerUserWithStaff (_staffData) {
  var ownerQuery = new Parse.Query(Parse.User);
  ownerQuery.equalTo("staffs", { "__type": "Pointer", "className": "_User", "objectId": _staffData.objectId });
  ownerQuery.include("staffs");
  return ownerQuery.first();
}

function getUserWithBusiness (_businessData) {
  var userQuery = new Parse.Query("User");
  userQuery.equalTo("business", { "__type": "Pointer", "className": "Business", "objectId": _businessData.objectId });
  userQuery.include("business");
  return userQuery.find();
}

exports.getOwnerUserWithStaff = getOwnerUserWithStaff;
exports.getUserWithBusiness   = getUserWithBusiness;
