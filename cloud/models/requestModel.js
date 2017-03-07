const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL
require('es6-promise').polyfill();
require('isomorphic-fetch');

const query = (method = 'GET', classOrFunc, objOrFilter = {}) => {
  let uri = classOrFunc
  let request = {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Parse-Application-Id': process.env.APP_ID,
      'X-Parse-REST-API-Key': process.env.REST_API_KEY
    }
  }
  if (method === 'POST' || method === 'PUT') {
    request.body = JSON.stringify(objOrFilter)
  }
  return fetch(process.env.SERVER_URL + uri, request)
    .then(function(response) {
        if (response.status >= 400) {
            throw new Error("Bad response from server");
        }
        return response.json();
    })
    .then(function(data) {
      return data;
    });
}

const getCloudCodeFunction = (funcName, data) => {
  return query('POST', '/functions/' + funcName, data)
}

exports.getCloudCodeFunction = getCloudCodeFunction;