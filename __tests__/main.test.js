const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL

// UNIT test begin
describe('Parse Test', () => {

    test('Hello Parse', () => {
        return Promise.resolve()
            .then(function() {
                return Parse.Cloud.run('hello');
            })
            .then(function(result) {
                expect(result).toBe("Hi");
            });
    });
});