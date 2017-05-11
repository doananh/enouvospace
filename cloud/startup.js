var _ = require('underscore');
var VenueModel   = require('./models/venueModel.js');
var PackageModel = require('./models/packageModel.js');
var ConfigModel   = require('./models/configModel.js');

Parse.Cloud.define("loadStartupData", function(req, res) {
  Parse.Promise.when([
    VenueModel.getAllVenue(),
    PackageModel.getAllPackage(),
    PackageModel.getAllPackageType(),
    ConfigModel.getConfig()
  ])
  .then(function (results) {
    return res.success({venues: results[0], packages: results[1], packageTypes: results[2], remoteConfig: results[3] && results[3].attributes});
  })
  .catch( function (error) {
    return res.error(error);
  });
});