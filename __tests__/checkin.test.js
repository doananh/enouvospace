const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});
var moments = require('moment');
var requestModel = require('./../cloud/models/requestModel');

// UNIT test begin
describe('CheckIn Test', () => {
    beforeAll (() => {

    });

    test('Integration test for check in and check out api', () => {
    	 var checkinParams = {
    	 	"UserId": null,
	    	"BusinessId": "vGtoDNyiyS",
	    	"PackageId": "5VEub2n51G"
	    };
	    requestModel.getCloudCodeFunction('checkin', checkinParams).then(function(bookingData) {
	    	if (bookingData && bookingData.result) {
	    		var code = bookingData.result.code;
		    	requestModel.getCloudCodeFunction('checkout', { "code": code }).then(function(data) {
					if (data && data.result) {
		    			expect(data.result.checkinTime).not.toBeUndefined();
				    	var checkinTime = data.result.checkinTime;
				    	var checkoutTime = moments(checkinTime).add(3, 'hours').toDate();
				    	// calculate duration time --------------
				        var subtractTime = moments(checkoutTime).diff(moments(checkinTime));
				        var durationTimeDetails = moments.duration(subtractTime);
				        var getHour = parseInt(durationTimeDetails.hours());
		    			expect(getHour).toBe(3);
		    			var servicePricing = 7000;
		    			var packagePricing = 10000;
		    			var discountPricing = 0;
		    			var packagePricingFollowTime = packagePricing * (parseInt(durationTimeDetails.hours()) + parseInt(durationTimeDetails.minutes())/60);
		    			var payment = packagePricingFollowTime + servicePricing - discountPricing;
				    	expect(payment).toBe(51000);
					}
	    		}, function(error) {
	    			expect(error).toThrow();
	    		});
	    	}
	    }, function(error) {
        	expect(error).toThrow();
	    });
    });

    afterAll (() => {

    });
});

