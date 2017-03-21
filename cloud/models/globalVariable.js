const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

var Tool  = require('./../utils/tools');

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
        console.log('latestAnonymousCode: ' +latestAnonymousCode);
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

exports.getLatestAnonymousCode  = getLatestAnonymousCode;
exports.generateAnonymousCode   = generateAnonymousCode;
