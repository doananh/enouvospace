const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});

const  PriceCalculatingUtil = require('./../cloud/util/PriceCalculatingUtil')

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL



// UNIT test begin
describe('Parse Test', () => {
    beforeAll (() => {
      // create sample booking here
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

    test('Fetch Package by ID', () => {
      var testPackage = new Parse.Object("Package");
      testPackage.id = "JzZjUF7lU1"; //day package JzZjUF7lU1
      return testPackage.fetch().then(function(data) {
        var jsonObject = data.toJSON();
        var expectId = jsonObject.objectId;
        expect(expectId).toBe('JzZjUF7lU1');
      }, function(error) {
        expect(error).toThrow();
      });
    });

    test('Fetch Services', () => {
      var services = ["yt9WERhBQ7", "0u7GmmSV4a"];
      var serviceQuery = new Parse.Query('Service');
      serviceQuery.containedIn('objectId', services);
      serviceQuery.include('servicePackage');
      return serviceQuery.find().then(function(result) {
        /// - data
        expect(result.length).toBe(2);
        result.forEach(function(service) {
          var jsonObject = service.toJSON();
          expect(jsonObject.servicePackage).not.toBeNull();
        });
        // check pricing
        var pricing = PriceCalculatingUtil.getServicePricingDetail(result);
        console.log(pricing)
        expect(pricing.items).not.toBeNull();
        expect(pricing.items.length).toBe(2)
        var total = 0;
        pricing.items.forEach(function(item) {
          total += item.count * item.chargeRate;
        });
        expect(pricing.total).toBe(total);
        // expect(pricing.total).toBe(11000);
      });
    });

    afterAll (() => {

    });
});
