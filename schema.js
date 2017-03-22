var request = require('request');
var fs = require('fs');
var moment = require('moment');
var _ = require('underscore');

var sendRequest = function(options, envData, onResult) {
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
            console.log('[Schema.js] Error: ', err);
        } else if (res.statusCode !== 200) {
            if (res.body) {
                console.log('[Schema.js] Error code ' + res.body.code + ': ' + res.body.error);
                updateChangelog('[Schema.js] Error code ' + res.body.code + ': ' + res.body.error, envData);
            } else {
                console.log('[Schema.js] Status: ', res.statusCode);
            }
        } else {
            onResult(data);
        }
    });
};

var saveFile = function(data, outputFilename) {

    if (!outputFilename) {
        var fileName = data && data.className ? data.className : '_Schemas';

        if (!fs.existsSync('schemas')) {
            fs.mkdirSync('schemas');
        }

        var outputFilename = 'schemas/' + fileName + '.json';
    }

    data = data.results ? data.results : data;

    fs.writeFile(outputFilename, JSON.stringify(data, null, 4), function(err) {
        if (err) {
            console.log("[Schema.js] " + err);
        } else {
            console.log("[Schema.js] JSON saved to " + outputFilename);
        }
    });
};

var readFile = function(fileName) {
    return JSON.parse(fs.readFileSync(fileName, 'utf8'));
};

var updateChangelog = function(text, envData) {

    var append = '\n\n' + moment().format("dddd, MMMM Do YYYY, h:mm:ss a") + '\n' + text;

    if (!fs.existsSync('schemas')) {
        fs.mkdirSync('schemas');
    }

    var dbname = envData.DATABASE_NAME || envData.NODE_ENV;
    dbname = dbname ? '_' + dbname : '';

    var filename = 'schemas/CHANGELOG' + dbname + '.md';

    fs.stat(filename, function(err, stat) {
        if (err == null) {
            fs.appendFile(filename, append, function(err) {

            });
        } else if (err.code == 'ENOENT') {
            fs.writeFile(filename, '#Changelog:\nDATABASE: '+ envData.DATABASE_URI + '\nSERVER: '+ envData.SERVER_URL + '\n');
            fs.appendFile(filename, append, function(err) {

            });
        } else {
            console.log('Some other error: ', err.code);
        }
    });
};

var getSchemas = function(className, envData, callback) {
    var url = className ? envData.SERVER_URL + "/schemas/" + className : envData.SERVER_URL + "/schemas";

    var options = {
        method: 'get',
        appId: envData.APP_ID,
        masterKey: envData.MASTER_KEY,
        url: url
    };

    sendRequest(options, envData, function(data) {
        console.log('[Schema.js] Get schemas');
        if (_.isFunction(callback)) callback(data);
    });
};

var addSchema = function(schema, envData, callback) {

    // Field objectId, createdAt, updatedAt, ACL cannot be added
    schema.fields = _.omit(schema.fields, 'objectId', 'createdAt', 'updatedAt', 'ACL');

    var options = {
        method: 'post',
        appId: envData.APP_ID,
        masterKey: envData.MASTER_KEY,
        data: schema,
        url: envData.SERVER_URL + "/schemas/" + schema.className
    };

    sendRequest(options, envData, function(data) {
        console.log('[Schema.js] Added schema: ' + schema.className);
        updateChangelog('[Schema.js] Added schema: ' + schema.className, envData);
        if (_.isFunction(callback)) callback(data);
    });
};

var deleteSchema = function(className, envData, callback) {
    var options = {
        method: 'delete',
        appId: envData.APP_ID,
        masterKey: envData.MASTER_KEY,
        url: envData.SERVER_URL + "/schemas/" + className
    };

    sendRequest(options, envData, function(data) {
        console.log('[Schema.js] Deleted schema: ' + className);
        updateChangelog('[Schema.js] Deleted schema: ' + className, envData);
        if (_.isFunction(callback)) callback(data);
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

    sendRequest(options, envData, function(data) {
        if (_.isFunction(callback)) callback(data);
    });
};

var clearAllData = function(className, envData, callback) {
    var options = {
        method: 'delete',
        appId: envData.APP_ID,
        masterKey: envData.MASTER_KEY,
        url: envData.SERVER_URL + "/purge/" + className
    };

    sendRequest(options, envData, function(data) {
        console.log('[Schema.js] Cleared all data in schema: ' + className);
        if (_.isFunction(callback)) callback(data);
    });
};

var compareSchemas = function (envData, className, savedClassData, currentClassData) {
    var deletedFields = {};
    var newFields = _.clone(savedClassData.fields);
    var changedFields = {};
    var logs = ['[Schema.js] Updated schema: ' + className];

    _.each(currentClassData.fields, function(value, key) {
        if (!savedClassData.fields[key]) {
            // removed fields
            var log = '[Schema.js] Removed field (' + className + '): ' + key + ' (' + value.type + ')';
            logs.push(log);
            deletedFields[key] = {
                "__op": "Delete"
            };
        } else if (savedClassData.fields[key].type !== value.type) {
            // changed fields
            var log = '[Schema.js] Updated field (' + className + '): ' + key + ' (' + value.type + ' => ' + savedClassData.fields[key].type + ')';
            logs.push(log);
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

    if (!_.isEmpty(newFields)) {
        logs.push('[Schema.js] Added fields (' + className + '):');
        logs.push('[Schema.js] ' + JSON.stringify(newFields));
    }

    var fields = _.extend(newFields, changedFields);

    if (!_.isEmpty(deletedFields)) {
        updateSchema({
            "className": className,
            "fields": deletedFields
        }, envData, function(data) {
            if (!_.isEmpty(fields)) {
                updateSchema({
                    "className": className,
                    "fields": fields,
                    "classLevelPermissions": savedClassData.classLevelPermissions
                }, envData, function() {
                    updateChangelog(logs.join('\n'), envData);
                    console.log(logs.join('\n'));
                });
            } else {
                updateChangelog(logs.join('\n'), envData);
                console.log(logs.join('\n'));
            }

        });
    } else if (!_.isEmpty(fields)) {
        updateSchema({
            "className": className,
            "fields": fields,
            "classLevelPermissions": savedClassData.classLevelPermissions
        }, envData, function() {
            updateChangelog(logs.join('\n'), envData);
            console.log(logs.join('\n'));
        });
    }
};

var importSchemasFromFile = function(envData, filePath) {
    getSchemas(null, envData, function(data) {
        var currentSchemasData = data.results;
        var savedSchemasData = readFile(filePath);
        var currentSchemas = _.pluck(currentSchemasData, 'className');

        if (_.isArray(savedSchemasData)) {
            var savedSchemas = _.pluck(savedSchemasData, 'className');
            var deletedSchemas = _.difference(currentSchemas, savedSchemas);
            var newSchemas = _.difference(savedSchemas, currentSchemas);
            var intersectionSchemas = _.intersection(currentSchemas, savedSchemas);

            // Delete schemas
            _.each(deletedSchemas, function(className) {
                if (envData.forceDelete) {
                    clearAllData(className, envData, function (data) {
                        deleteSchema(className, envData);
                    });
                } else {
                    deleteSchema(className, envData);
                }
            });

            // Add new schemas
            _.each(newSchemas, function(className) {
                var classData = _.findWhere(savedSchemasData, { className: className });
                addSchema(classData, envData);
            });

            // Check updated schemas
            _.each(intersectionSchemas, function(className) {
                var savedClassData = _.findWhere(savedSchemasData, { className: className });
                var currentClassData = _.findWhere(currentSchemasData, { className: className });
                compareSchemas(envData, className, savedClassData, currentClassData);
            });
        } else {
            if (savedSchemasData && savedSchemasData.className) {
                if (_.indexOf(currentSchemas, savedSchemasData.className) > -1) {
                    var currentClassData = _.findWhere(currentSchemasData, { className: savedSchemasData.className });
                    compareSchemas(envData, savedSchemasData.className, savedSchemasData, currentClassData);
                } else {
                    addSchema(savedSchemasData, envData);
                }
            }
        }
    });
};

var exportSchemasToFile = function (envData, className, filePath) {
    getSchemas(className, envData, function(data) {
        saveFile(data, filePath);
    });
};

var watch = function(envData) {
    exportSchemasToFile(envData);
};

var initialize = function () {
    var args = process.argv.slice(2);
    var envData = process.env;

    if (args[0] === 'import') {
        var filePath = args[1] || 'schemas/_Schemas.json';
        if (_.indexOf(args, 'forceDelete=1') > -1) envData.forceDelete = true;
        importSchemasFromFile(envData, filePath);
    }

    if (args[0] === 'export') {
        var filePath = args[2];
        var className = args[1];
        if (!filePath && className && className.indexOf('.json') > -1) {
            filePath = args[1];
            className = null;
        }
        exportSchemasToFile(envData, className, filePath);
    }
};

initialize();

exports.watch = watch;
