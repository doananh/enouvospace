const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});
var moments = require('moment');
const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

var DiscountModel = require('../../cloud/models/discountModel.js');

describe('Discount Test', () => {
    beforeAll (() => {
      // create sample booking here
    });

    test.skip('Service Price', () => {
      const date = new Date("2017-02-25T07:19:11.388Z");
      return DiscountModel.getDiscountByTimeAndPackage("HOUR", date)
      .then(function(result) {
        console.log(result);
      });
    });

    afterAll (() => {

    });
});
