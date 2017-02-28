var _ = require('underscore');

Parse.Cloud.define('deleteCategory', function(request, response) {
  var query = new Parse.Query('Categories');
  query.get(request.params.objectId).then(function(data) {
    if (data) {
      data.destroy({useMasterKey: true}).then(function(category) {
        if (category) {
          var reasonQuery = new Parse.Query('Reasons');
          reasonQuery.equalTo("category", { "__type": "Pointer", "className": "Categories", "objectId": request.params.objectId });
          reasonQuery.find().then(function(reasons) {
            if (reasons) {
              var results = _.map(reasons, function(reason) {
                return reason.destroy({useMasterKey: true});
              });
              response.success(results)
            }
          }, function(err) {
            response.error(err);
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

Parse.Cloud.afterSave("Reasons", function(request) {
  var reasonData = request.object.toJSON();
  if (reasonData && reasonData.category) {
    var categoryQuery = new Parse.Query('Categories');
    categoryQuery.equalTo("objectId", reasonData.category.objectId);
    categoryQuery.first().then(function(category) {
      var reasons = category.get("reasons");
      reasons = reasons.concat({ name: reasonData.name, objectId: reasonData.objectId, vn: reasonData.vn, en: reasonData.en });
      category.set("reasons", reasons);
      category.save(null, { useMasterKey: true }).then(function(result) {
      }, function(error) {
        console.error("Got an error " + error.code + " : " + error.message);
      });
    }, function(error) {
      console.error("Got an error " + error.code + " : " + error.message);
    });
  }
});
