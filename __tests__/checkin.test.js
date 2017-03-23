const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});
const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

// Integration test begin
describe('Checkin Test', () => {
    beforeAll (() => {

    });

    test.skip('Test anonymous checkin test ', () => {
        return Promise.resolve()
              .then(function() {
                  return Parse.Cloud.run('checkin', {});
              })
              .then(function(result) {
                console.log(result.toJSON())
              });
    });

    afterAll (() => {

    });
});
