var _ = require('underscore');
var ReasonUtil = require('./util/ReasonUtil');

Parse.Cloud.define('deleteReason', function(request, response) {
  var reasonData = request.params;
  var reasonQuery = new Parse.Query('Reasons');

  reasonQuery.get(reasonData.reason_id).then(function(data) {
    if (data) {
      data.destroy({useMasterKey: true}).then(function(reason) {
        if (reason) {
          ReasonUtil.getReasonsIntoCategoriesClass(reasonData).then(function(result) {
            if (result) {
              ReasonUtil.removeReasonsIntoCategoriesClass(reasonData, result).then(function(reasonArray) {
                ReasonUtil.getReasonsIntoBusinessClass(reasonData).then(function(businesses) {
                  if (businesses) {
                    var final = _.after(businesses.length, function finalSuccess() {
                      response.success(reasonData);
                    });
                    _.each(businesses, function(businessDocument) {
                      ReasonUtil.removeReasonInBusinessClass(businessDocument, reasonData);
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
