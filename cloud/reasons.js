var _ = require('underscore');
Parse.Cloud.define('deleteReason', function(request, response) {
  var reasonData = request.params;
  var reasonQuery = new Parse.Query('Reasons');

  reasonQuery.get(reasonData.reason_id).then(function(data) {
    if (data) {
      data.destroy({useMasterKey: true}).then(function(reason) {
        if (reason) {
          getReasonsIntoCategoriesClass(reasonData).then(function(result) {
            if (result) {
              removeReasonsIntoCategoriesClass(reasonData, result).then(function(reasonArray) {
                getReasonsIntoBusinessClass(reasonData).then(function(businesses) {
                  if (businesses) {
                    var final = _.after(businesses.length, function finalSuccess() {
                      response.success(reasonData);
                    });
                    _.each(businesses, function(businessDocument) {
                      removeReasonInBusinessClass(businessDocument, reasonData);
                      final();
                    });
                  }
                }, function(error) {
                  response.error(error);
                });
              }, function(error) {
                response.error(error);
              });
            }
          }, function(error) {
            response.error(error);
          });
        }
      }, function (error) {
        response.error(error);
      });
    }
  }, function(err) {
    response.error(err);
  });
});

function getReasonsIntoCategoriesClass(_reasonData) {
  var categoryQuery = new Parse.Query("Categories");
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
  businessQuery.equalTo("availableReasons", { "__type": "Pointer", "className": "Reasons", "objectId": _reasonData.reason_id });
  return businessQuery.find();
}

function removeReasonInBusinessClass(_businessDocument, _reasonData) {
  var availableReasons = _businessDocument.get("availableReasons");
  var reasons = [];
  _.each(availableReasons, function(availableReason) {
    if (availableReason.id !== _reasonData.reason_id) {
      reasons.push({ "__type": "Pointer", "className": "Reasons", "objectId": availableReason.id });
    }
  });
  _businessDocument.set("availableReasons", reasons);
  _businessDocument.save(null, {useMasterKey: true});
}