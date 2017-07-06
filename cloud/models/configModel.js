const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

function getConfig () {
  return new Promise((resolve, reject) => {
      Parse.Config.get()
      .then(function (configData) {
        return resolve(configData);
      })
      .catch(function (error) {
        return reject(error);
      })
  });
}

function getConfigTableData () {
  return new Promise((resolve, reject) => {
      var query = new Parse.Query("Configuration");
      query.first().then(function (data) {
          return resolve(data ? data.toJSON() : data);
      })
      .catch(function (error) {
          return reject(error);
      });
  });
}

exports.getConfig = getConfig;
exports.getConfigTableData = getConfigTableData;
