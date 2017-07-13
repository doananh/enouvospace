var Constants = require('../constant.js');
var _ = require('underscore');

function getAllVenue () {
  return new Promise((resolve, reject) => {
      var query = new Parse.Query("Venue");
      query.ascending("order");
      query.find().then( function (result) {
        if (result && result.length) {
          const jsonData = _.map(result, function(element){ return element.toJSON()});
          return resolve(jsonData);
        }
        else {
          throw('No venues data found');
        }
      })
      .catch( function (error) {
        return reject(error);
      });
  });
}

exports.getAllVenue  = getAllVenue;
