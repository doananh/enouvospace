const express = require('express');
const http = require('http');
require('dotenv').config({path: "./.env"});
var moments = require('moment');
var Tool = require('./../cloud/util/Tool');
var BookingUtil = require('./../cloud/util/BookingUtil');

// UNIT test begin
describe('CheckIn Test', () => {
    beforeAll (() => {

    });

    test('Integration test for check in and check out api', () => {
	    var testCode = Tool.getCode();
	    expect(testCode).toBe('A001');
	    var params = {
	    	"BusinessId": "vGtoDNyiyS",
	    	"PackageId": "5VEub2n51G"
	    };
	    BookingUtil.createNewBooking(null, params, testCode).then(function(bookingData) {
	    	var code = bookingData.get("code");
    		BookingUtil.getAnonymousUserInBooking({ "code": code }).then(function(data) {
		    	var objectJSON = data.toJSON();
    			expect(objectJSON.startTime).not.toBeUndefined();
		    	var checkinTime = objectJSON.startTime.iso;
		    	var checkoutTime = moments(checkinTime).add(3, 'hours').toDate();
		    	// calculate duration time --------------
		        var subtractTime = moments(checkoutTime).diff(moments(checkinTime));
		        var durationTimeDetails = moments.duration(subtractTime);
		        var getHour = parseInt(durationTimeDetails.hours());
    			expect(getHour).toBe(3);
    			var servicePricing = 7000;
    			var packagePricing = 10000;
    			var discountPricing = 0;
    			var servicePricingFollowTime = servicePricing * (parseInt(durationTimeDetails.hours()) + parseInt(durationTimeDetails.minutes())/60);
    			var payment = (packagePricing + servicePricingFollowTime - discountPricing);
		    	expect(payment).toBe(51000);
    		}, function(error) {
    			expect(error).toThrow();
    		});
	    }, function(error) {
        	expect(error).toThrow();
	    });
    });

    afterAll (() => {

    });
});
