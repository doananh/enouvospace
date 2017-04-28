var _ = require('underscore');
var VenueModel   = require('./models/venueModel.js');
var PackageModel = require('./models/packageModel.js');

Parse.Cloud.define("loadStartupData", function(req, res) {
  Parse.Promise.when([
    VenueModel.getAllVenue(),
    PackageModel.getAllPackage()
  ])
  .then(function (results) {
    return res.success({venues: results[0], packages: results[1], });
  })
  .catch( function (error) {
    return res.error(error);
  });
});
