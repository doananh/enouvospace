var _ = require('underscore');
var moments = require('moment');
var Tool = require('./utils/tools.js');
var PackageModel = require('./models/packageModel.js');

Parse.Cloud.define("loadPackageData", function(req, res) {
  PackageModel.getAllPackage()
  .then( function (data) {
    return res.success(data);
  })
  .catch( function (error) {
    return res.error(error);
  });
});
