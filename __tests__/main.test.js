const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});

//======== this is a function for preventing __mock =======
// jest.unmock('mockData');
//======== END UNMOCK =====================================

jest.mock('models/bookingModel.js');
jest.mock('models/priceCalculatingModel.js');

var BookingMock = require('models/bookingModel.js');
var PricingMock = require('models/priceCalculatingModel.js');

// UNIT test begin
describe('Main Test', () => {
    beforeAll (() => {

    });

    test.skip('getUserBooking Mocks Request', () => {
      return PricingMock.getBookingPricingDetail("ANONYMOUS")
        .then((data) => {
          console.log(data);
          expect(data.code).toBeUndefined();
        });
    });

    test.skip('getMultiValueReturnBooking Mocks Request 1', () => {
      return BookingMock.getMultiValueReturnBooking()
      .then((data) => {
        console.log(data);
      });

    });

    test.skip('getMultiValueReturnBooking Mocks Request 2', () => {
      return BookingMock.getMultiValueReturnBooking()
        .then((data) => {
          console.log(data);
        });
    });

    afterAll (() => {

    });
});
