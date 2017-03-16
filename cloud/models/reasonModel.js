function getReasonsIntoCategoriesClass(_reasonData) {
  var categoryQuery = new Parse.Query("Category");
  categoryQuery.equalTo("objectId", _reasonData.category_id);
  return categoryQuery.first();
}

function removeReasonsIntoCategoriesClass(_reasonData, _result) {
  var reasons = _result.get("reasons");
  var reasonArray = [];
  _.each(reasons, function(reason) {
    if (reason.objectId !== _reasonData.reason_id) {
      reasonArray.push({ "name": reason.name, "objectId": reason.objectId });
    }
  });
  _result.set("reasons", reasonArray);
  return _result.save(null, {useMasterKey: true});
}

function getReasonsIntoBusinessClass(_reasonData) {
  var businessQuery = new Parse.Query("Business");
  businessQuery.equalTo("availableReasons", { "__type": "Pointer", "className": "Reason", "objectId": _reasonData.reason_id });
  return businessQuery.find();
}

function removeReasonInBusinessClass(_businessDocument, _reasonData) {
  var availableReasons = _businessDocument.get("availableReasons");
  var reasons = [];
  _.each(availableReasons, function(availableReason) {
    if (availableReason.id !== _reasonData.reason_id) {
      reasons.push({ "__type": "Pointer", "className": "Reason", "objectId": availableReason.id });
    }
  });
  _businessDocument.set("availableReasons", reasons);
  _businessDocument.save(null, {useMasterKey: true});
}

exports.getReasonsIntoCategoriesClass     = getReasonsIntoCategoriesClass;
exports.removeReasonsIntoCategoriesClass  = removeReasonsIntoCategoriesClass;
exports.getReasonsIntoBusinessClass       = getReasonsIntoBusinessClass;
exports.removeReasonInBusinessClass       = removeReasonInBusinessClass;
