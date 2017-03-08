const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});

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
