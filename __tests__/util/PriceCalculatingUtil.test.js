const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});

const  PriceCalculatingUtil = require('./../../cloud/util/PriceCalculatingUtil');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL

describe('Price Calculating Util Test', () => {
    beforeAll (() => {
      // create sample booking here
    });

    test('Service Price', () => {
      var services = ["yt9WERhBQ7", "0u7GmmSV4a"];
      var serviceQuery = new Parse.Query('Service');
      serviceQuery.containedIn('objectId', services);
      serviceQuery.include('servicePackage');
      return serviceQuery.find().then(function(result) {
        /// - data
        expect(result.length).toBe(services.length);
        result.forEach(function(service) {
          var jsonObject = service.toJSON();
          expect(jsonObject.servicePackage).not.toBeNull();
        });
        // check pricing
        
        var pricing = PriceCalculatingUtil.getServicePricingDetail(result);
        expect(pricing.items).not.toBeNull();
        expect(pricing.items.length).toBe(2)
        var total = 0;
        pricing.items.forEach(function(item) {
          total += item.count * item.chargeRate;
        });
        expect(pricing.total).toBe(total);
      });
    });

    test('Package Price', () => {
      var testPackage = new Parse.Object("Package");
      testPackage.id = "JzZjUF7lU1";
      return testPackage.fetch().then(function(data) {
        var jsonObject = data.toJSON();
        expect(jsonObject.objectId).toMatch(testPackage.id);
        expect(jsonObject.type).not.toBeNull();
        expect(jsonObject.chargeRate).not.toBeUndefined();
        expect(jsonObject.name).not.toBeNull();
      }, function(error) {
        expect(error).toThrow();
      });
    });

    afterAll (() => {

    });
});
