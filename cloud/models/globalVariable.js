
var Tool  = require('./../utils/tools.js');

function getLatestAnonymousCode() {
  return new Promise((resolve, reject) => {
    var query = new Parse.Query("GlobalVariable");
    query.first().then(function (data) {
      if (data) {
        resolve(data.get('latestAnonymousCode'));
      }
      else {
        reject('No global variable is in GlobalVariable');
      }
    }, function (error) {
      reject(error);
    });
  }, function (error) {
    reject(error);
  });
}

function generateAnonymousCode() {
  return new Promise((resolve, reject) => {
    var query = new Parse.Query("GlobalVariable");
    query.first().then(function (globalVar) {
      if (globalVar) {
        var latestAnonymousCode = globalVar.get('latestAnonymousCode');
        var newCode = Tool.getCode(latestAnonymousCode);
        globalVar.set("latestAnonymousCode", newCode);
        globalVar.save()
        resolve(newCode);
      }
      else {
        reject('No global variable is in GlobalVariable');
      }
    }, function (globalVarQueryError) {
      reject(globalVarQueryError);
    });
  }, function (promiseError) {
    reject(promiseError);
  });
}

function getAnonymousPackage () {
  return new Promise((resolve, reject) => {
      var query = new Parse.Query("GlobalVariable");
      query.include("anonymousPackage");
      query.first().then(function (data) {
        if (data) {
          var anonymousPackage = data.get('anonymousPackage');
          return resolve(anonymousPackage);
        }
        else {
          // create new default here
          return resolve({/* */});
        }
    })
    .catch(function (error) {
      return reject(error);
    });
  });
}

exports.getAnonymousPackage     = getAnonymousPackage;
exports.getLatestAnonymousCode  = getLatestAnonymousCode;
exports.generateAnonymousCode   = generateAnonymousCode;
