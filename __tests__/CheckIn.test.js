const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL

// UNIT test begin
describe('CheckIn Test', () => {
    beforeAll (() => {

    });

    test.skip('Hello CheckIn', () => {
        return expect(true).toBe(true)
    });

    afterAll (() => {

    });
});
