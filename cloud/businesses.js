var _ = require('underscore');
Parse.Cloud.beforeDelete("Business", function(request, response) {
  var businessData = request.object.toJSON();
  getUsers(businessData).then(function(results) {
    if (results) {
      var final = _.after(results.length, function finalSuccess() {
        response.success(businessData);
      });
      _.each(results, function(result) {
        var businesses = result.get("business");
        var businessArray =[];
        _.each(businesses, function(business) {
          if (business.id !== businessData.objectId) {
            businessArray.push({ "__type": "Pointer", "className": "Business", "objectId": business.id });
          }
        });
        result.set("business", businessArray);
        result.save(null, {useMasterKey: true});
        final();
      });
    }
  }, function(error) {
    response.error(error);
  });
});

function getUsers(_businessData) {
  var userQuery = new Parse.Query("User");
  userQuery.equalTo("business", { "__type": "Pointer", "className": "Business", "objectId": _businessData.objectId });
  userQuery.include("business");
  return userQuery.find();
}
