var Constants = require('../constant.js');
var _ = require('underscore');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

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
