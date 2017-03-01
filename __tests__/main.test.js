const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL

//======== this is a function for preventing __mock =======
//var request = require('./../cloud/request');
// jest.unmock('request');
//======== END UNMOCK =====================================

jest.mock('request');

// UNIT test begin
describe('Main Test', () => {
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

    test('getUserBooking Mocks Request', () => {
      // return request.getUserBooking() => for unmock, test real data
        return require('request').getUserBooking()
        .then((data) => {
          console.log(data);
          expect(data.code).toBeNull();
        });
    });

    test('getAnonymousBooking Mocks Request', () => {
      // return request.multiReturnValueBooking()
      return require('request').multiReturnValueBooking()
        .then((data) => {
          // console.log(data);
          expect(data.length).toBe(2);
        });
    });

    afterAll (() => {

    });
});
