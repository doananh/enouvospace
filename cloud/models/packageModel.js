var Constants = require('../constant.js');
var _ = require('underscore');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

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

function getAllPackageType () {
  return new Promise((resolve, reject) => {
      var query = new Parse.Query("PackageType");
      query.ascending("order");
      query.find().then( function (result) {
        if (result && result.length) {
          const jsonData = _.map(result, function(element){ return element.toJSON()});
          return resolve(jsonData);
        }
        else {
          throw('No packageType data found');
        }
      })
      .catch( function (error) {
        return reject(error);
      });
  });
}

function getPackageById (_id) {
  return new Promise((resolve, reject) => {
    var query = new Parse.Query("Package");
    query.ascending("order");
    if (_id) {
      query.equalTo("objectId", _id);
    }
    else {
      return reject('require package id params')
    }
    query.first().then(function (package) {
      return resolve(package);
    })
    .catch( function (error) {
      return reject(error);
    });
  });

}

exports.getPackageById    = getPackageById;
exports.getAllPackage     = getAllPackage;
exports.getAllPackageType = getAllPackageType;
