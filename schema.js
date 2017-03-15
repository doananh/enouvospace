var http = require("http");
var https = require("https");
var request = require('request');
var fs = require('fs');
var moment = require('moment');
var _ = require('underscore');
/**
 * sendRequest:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param onResult: callback to pass the results JSON object(s) back
 */

var sendRequest = function(options, onResult) {
    request({
        method: options.method,
        url: options.url,
        json: options.data || true,
        headers: {
            "X-Parse-Application-Id": options.appId,
            "X-Parse-Master-Key": options.masterKey,
            "Content-Type": "application/json",
            "parse-schema-sync-module": true
        }
    }, function(err, res, data) {
        if (err) {
            console.log('Error: ', err);
        } else if (res.statusCode !== 200) {
            console.log('Status: ', res.statusCode);
        } else {
            onResult(data);
        }
    });
};

var saveFile = function(data) {

    var fileName = data && data.className ? data.className : '_Schemas';

    if (!fs.existsSync('schemas')) {
        fs.mkdirSync('schemas');
    }

    var outputFilename = 'schemas/' + fileName + '.json';

    fs.writeFile(outputFilename, JSON.stringify(data, null, 4), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + outputFilename);
        }
    });
};

var getSchemas = function(envData, callback) {
    var options = {
        method: 'get',
        appId: envData.APP_ID,
        masterKey: envData.MASTER_KEY,
        url: envData.SERVER_URL + "/schemas"
    };

    var schemas = sendRequest(options, function(data) {
        console.log('[Schema.js] Get schemas');
        console.log(data);
        if (_.isFunction(callback)) callback(data);
        saveFile(data);
    });
};

var addSchema = function(schema, envData, callback) {
    var options = {
        method: 'post',
        appId: envData.APP_ID,
        masterKey: envData.MASTER_KEY,
        data: schema,
        url: envData.SERVER_URL + "/schemas/" + schema.className
    };

    var schemas = sendRequest(options, function(data) {
        console.log('[Schema.js] Added schema: ' + schema.className);
        if (_.isFunction(callback)) callback(data);
        // console.log(data);
    });
};

var deleteSchema = function(className, envData, callback) {
    var options = {
        method: 'delete',
        appId: envData.APP_ID,
        masterKey: envData.MASTER_KEY,
        url: envData.SERVER_URL + "/schemas/" + className
    };

    var schemas = sendRequest(options, function(data) {
        console.log('[Schema.js] Deleted schema: ' + className);
        if (_.isFunction(callback)) callback(data);
        // console.log(data);
    });
};

var updateSchema = function(schema, envData, callback) {
    var options = {
        method: 'put',
        appId: envData.APP_ID,
        masterKey: envData.MASTER_KEY,
        data: schema,
        url: envData.SERVER_URL + "/schemas/" + schema.className
    };

    var schemas = sendRequest(options, function(data) {
        console.log('[Schema.js] Updated schema: ' + schema.className);
        if (_.isFunction(callback)) callback(data);
        // console.log(data);
    });
};

var init = function(envData) {
};

exports.init = init;
