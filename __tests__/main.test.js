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

// jest.mock('request');
jest.mock('mockData');

var MockData = require('mockData');

// UNIT test begin
describe('Main Test', () => {
    beforeAll (() => {

    });

    test.skip('Test Get Pricing', () => {
        return Promise.resolve()
            .then(function() {
                return Parse.Cloud.run('getPricingDetail',{BookingId: "7Qheagi7pq"});
            })
            .then(function(result) {
              console.log(result)
              expect(result.servicePricing.total).toBeGreaterThanOrEqual(0);
              expect(result.packagePricing.total).toBeGreaterThan(0);
              expect(result.payAmount).toBeGreaterThan(0);
            });
    });

    test.skip('getUserBooking Mocks Request', () => {
      // return request.getUserBooking() => for unmock, test real data
        return MockData.getBookingByPackage('USER_HOURS')
        .then((data) => {
          console.log(data);
          expect(data.code).toBeNull();
        });
    });

    test.skip('getMultiValueReturnBooking Mocks Request 1', () => {
      // return request.multiReturnValueBooking()
      return MockData.getMultiValueReturnBooking()
      .then((data) => {
        console.log(data);
      });

    });

    test.skip('getMultiValueReturnBooking Mocks Request 2', () => {
      // return request.multiReturnValueBooking()
      return MockData.getMultiValueReturnBooking()
        .then((data) => {
          console.log(data);
        });
    });

    afterAll (() => {

    });
});
