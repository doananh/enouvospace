
const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

function getDefaultPackage () {
  return getPackageByType();
}

function getPackageByType (_type = 'HOUR') {
  return new Promise((resolve, reject) => {
    if (_type) {
      var packageQuery = new Parse.Query("Package")
      packageQuery.equalTo("type", _type);
      packageQuery.first().then(function (result) {
        if (result) {
          resolve({"name": result.get('name'), "type": result.get('type'),  "chargeRate": result.get('chargeRate'), "objectId": result.id});
        }
        else {
          reject("No package found with type " + _type);
        }
      }, function (error) {
        reject(error);
      });
    }
    else {
      reject('Require type of package');
    }
  }, function (error) {
    reject(error);
  });
}

exports.getDefaultPackage = getDefaultPackage;
exports.getPackageByType  = getPackageByType;
