const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});
const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

// Integration test begin
describe('CheckIn Test', () => {
    beforeAll (() => {

    });

    test.skip('Test Get Pricing', () => {
        return Promise.resolve()
              .then(function() {
                  return Parse.Cloud.run('getPricingDetail',{BookingId: "kkEHuQEYjp"});
              })
              .then(function(result) {
                console.log(result)
                expect(result.servicePricing.total).toBeGreaterThanOrEqual(0);
                expect(result.packagePricing.total).toBeGreaterThan(0);
                expect(result.payAmount).toBeGreaterThan(0);
              });
    });

    afterAll (() => {

    });
});
