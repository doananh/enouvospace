const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL



// UNIT test begin
describe('Parse Test', () => {
    beforeAll (() => {

    });

    test.skip('Hello Parse', () => {
        return Promise.resolve()
            .then(function() {
                return Parse.Cloud.run('hello');
            })
            .then(function(result) {
                expect(result).toBe("Hi");
            });
    });

    test('Fetch Package by ID', () => {
      var testPackage = new Parse.Object("Package");
      testPackage.id = "JzZjUF7lU1"; //day package JzZjUF7lU1
      return testPackage.fetch().then(function(data) {
        var jsonObject = data.toJSON();
        var expectId = jsonObject.objectId;
        expect(expectId).toBe('JzZjUF7lU1');
      }, function(error) {
        expect(error).toThrow();
      });
    });

    afterAll (() => {

    });
});
