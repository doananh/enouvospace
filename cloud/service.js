var _ = require('underscore');
var moments = require('moment');
var Tool = require('./utils/tools');

Parse.Cloud.define("addService", function(req, res) {
  var params = req.params;
  if (params && params.ServicePackageId && params.count) {
    var servicePackageId = params.ServicePackageId;
    var count            = params.count;
    var startTime        = params.startTime;
    var endTime          = params.endTime;

    var serviceQuery = new Parse.Query("Service");
    serviceQuery.include("servicePackage");
    serviceQuery.equalTo("servicePackage", {"__type": "Pointer","className": "ServicePackage","objectId": servicePackageId});
    serviceQuery.first()
    .then(function (service) {
      if (service && service.get('servicePackage')) {
        var servicePackage = service.get('servicePackage');
        var amount         = servicePackage.get('chargeRate') * count;
        service.set("amount",  amount);
        service.save().then(function (saveResult) {
          res.success(saveResult);
        }, function (serviceSaveError) {
          return res.error(serviceSaveError);
        });
      }
      else {
        throw('No service package data found');
      }
    })
    .catch ( function (error) {
      return res.error(error);
    });
  }
  else {
    return res.error('Require service package & count params for adding new service');
  }
});
