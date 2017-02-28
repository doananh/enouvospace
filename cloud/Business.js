var _ = require('underscore');
var UserUtil = require('./util/UserUtil')

Parse.Cloud.beforeDelete("Business", function(request, response) {
  var businessData = request.object.toJSON();
  UserUtil.getUserWithBusiness(businessData).then(function(results) {
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
