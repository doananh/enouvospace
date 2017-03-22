const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});
var moments = require('moment');
const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

// Integration test begin
describe('CheckIn Test', () => {
    beforeAll (() => {

    });

    test.skip('Integration test for check in and check out api', () => {
    	 var checkinParams = {
        // ser: {
        //   id: 'MS2ACErugM',
        //   username: 'user'
        // }
	    };
	    return Promise.resolve()
            .then(function() {
                return Parse.Cloud.run('checkin',checkinParams);
            })
            .then(function(result) {
              console.log(result);
              //   if (result && result.code) {
	            //   	var code = result.code;
	            //   	Parse.Cloud.run('checkout', { "code": code })
	            //   	.then(function(data) {
      	  		//  			expect(data.checkinTimeToDate).not.toBeUndefined();
      				//     	var checkinTime = data.checkinTimeToDate;
      				//     	var checkoutTime = moments(checkinTime).add(3, 'hours').toDate();
      				//     	// calculate duration time --------------
    				  //       var subtractTime = moments(checkoutTime).diff(moments(checkinTime));
    				  //       var durationTimeDetails = moments.duration(subtractTime);
    				  //       var getHour = parseInt(durationTimeDetails.hours());
      		    // 			expect(getHour).toBe(3);
              //
      		    // 			var servicePricing = 7000;
      		    // 			var packagePricing = 10000;
      		    // 			var discountPricing = 0;
      		    // 			var packagePricingFollowTime = packagePricing * (parseInt(durationTimeDetails.hours()) + parseInt(durationTimeDetails.minutes())/60);
      		    // 			var payment = packagePricingFollowTime + servicePricing - discountPricing;
      				//     	expect(payment).toBe(51000);
	            //   	});
	            // }
            });
    });

    afterAll (() => {

    });
});
