const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});
const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

// Integration test begin
describe('Service Test', () => {
    beforeAll (() => {

    });

    tests.skip('Test add service', () => {
        return Promise.resolve()
              .then(function() {
                  return Parse.Cloud.run('addService',{ServicePackageId: '8BZ6TbLnEz', count: 2});
              })
              .then(function(result) {
                console.log(result.toJSON())
              });
    });

    afterAll (() => {

    });
});
