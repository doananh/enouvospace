var Constants = require('../constant.js');
var _ = require('underscore');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

function getDefaultPackage () {
  return getPackageByType(Constants.DEFAULT_PACKAGE_TYPE);
}

function getAllPackage () {
  return new Promise((resolve, reject) => {
      var query = new Parse.Query("Package");
      query.ascending("order");
      query.find().then( function (result) {
        if (result && result.length) {
          const jsonData = _.map(result, function(element){ return element.toJSON()});
          return resolve(jsonData);
        }
        else {
          throw('No package data found');
        }
      })
      .catch( function (error) {
        return reject(error);
      });
  });
}

function getPackageByType (_type) {
  return new Promise((resolve, reject) => {
    if (_type) {
      var packageQuery = new Parse.Query("Package")
      packageQuery.equalTo("type", _type);
      packageQuery.first()
      .then( function (result) {
        if (result) {
          return resolve({"name": result.get('name'), "type": result.get('type'),  "chargeRate": result.get('chargeRate'), "objectId": result.id});
        }
        else {
          throw("No package found with type " + _type);
        }
      })
      .catch( function (error) {
        return reject(error);
      });
    }
    else {
      return reject('Require type of package');
    }
  });
}

exports.getDefaultPackage = getDefaultPackage;
exports.getPackageByType  = getPackageByType;
exports.getAllPackage     = getAllPackage;
