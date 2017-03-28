const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});
const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

// Integration test begin
describe('Checkout Test', () => {
    beforeAll (() => {

    });

    test.skip('Test checkout by booking id', () => {
        return Promise.resolve()
              .then(function() {
                  return Parse.Cloud.run('checkoutByBookingId',{bookingId: '0C8CBmn9Vx'});
              })
              .then(function(result) {
                console.log(result)
              });
    });

    test.skip('Test checkout by booking code', () => {
        return Promise.resolve()
              .then(function() {
                  return Parse.Cloud.run('checkoutByCode',{code: 'A003'});
              })
              .then(function(result) {
                console.log(result);
              });
    });

    afterAll (() => {

    });
});
