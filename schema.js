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

var importSchemasFromFile = function (envData, filePath) {
    getSchemas(envData, function(data) {
        var currentSchemasData = data.results;
        var savedSchemasData = readFile(filePath);

        var savedSchemas = _.pluck(savedSchemasData, 'className');
        var currentSchemas = _.pluck(currentSchemasData, 'className');


        var deletedSchemas = _.difference(currentSchemas, savedSchemas);
        var newSchemas = _.difference(savedSchemas, currentSchemas);
        var intersectionSchemas = _.intersection(currentSchemas, savedSchemas);

        // Delete schemas
        _.each(deletedSchemas, function (className) {
            deleteSchema(className, envData);
        });

        // Add new schemas
        _.each(newSchemas, function (className) {
            var classData = _.findWhere(savedSchemasData, {className: className});
            // Field objectId, createdAt, updatedAt, ACL cannot be added
            classData.fields = _.omit(classData.fields, 'objectId', 'createdAt', 'updatedAt', 'ACL');
            addSchema(classData, envData);
        });

        // Check updated schemas
        _.each(intersectionSchemas, function(className) {
            var savedClassData = _.findWhere(savedSchemasData, { className: className });
            var currentClassData = _.findWhere(currentSchemasData, { className: className });
            var deletedFields = {};
            var newFields = _.clone(savedClassData.fields);
            var changedFields = {};

            _.each(currentClassData.fields, function(value, key) {
                if (!savedClassData.fields[key]) {
                    // removed fields
                    console.log('Removed field: ' + key + ' (' + value.type + ')');
                    deletedFields[key] = {
                        "__op": "Delete"
                    };
                } else if (savedClassData.fields[key].type !== value.type) {
                    // changed fields
                    console.log('Updated field: ' + key + ' (' + value.type + ' => ' + savedClassData.fields[key].type + ')');
                    deletedFields[key] = {
                        "__op": "Delete"
                    };
                    changedFields[key] = savedClassData.fields[key];
                    delete newFields[key];
                } else {
                    // unchanged fields
                    delete newFields[key];
                }
            });

            var fields = _.extend(newFields, changedFields);

            if (!_.isEmpty(deletedFields) && !_.isEmpty(fields)) {
                updateSchema({
                    "className": className,
                    "fields": deletedFields
                }, envData, function(data) {
                    updateSchema({
                        "className": className,
                        "fields": fields,
                        "classLevelPermissions": savedClassData.classLevelPermissions
                    }, envData);
                });
            } else if (!_.isEmpty(fields)) {
                updateSchema({
                    "className": className,
                    "fields": fields,
                    "classLevelPermissions": savedClassData.classLevelPermissions
                }, envData);
            }


        });
    });
};

exports.init = init;
