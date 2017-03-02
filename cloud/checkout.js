var _ = require('underscore');
var moments = require('moment');
var PriceCalculatingUtil = require('./util/PriceCalculatingUtil');
var BookingUtil        = require('./util/BookingUtil');

Parse.Cloud.define("checkout", function(req, res) {
  var params = req.params;
  if (params && params.code) {
    BookingUtil.getAnonymousUserInBooking(params)
    .then(function (bookingData) {
      PriceCalculatingUtil.getBookingPricingDetail(bookingData)
        .then(function(result) {
          if (result) {
            var startTime = result.validTime.startTime;
            var endTime = result.validTime.endTime;
            var StartTimeString = result.validTime.StartTimeString;
            var strEndTimeString = result.validTime.strEndTimeString;
            var packagePricing = result.packagePricing.total;
            var packageType = result.packagePricing.package.name;
            var packageRate = result.packagePricing.package.chargeRate;
            var packageCount = result.packageCount;
            var servicePricing = result.servicePricing.total;
            var discountPricing = result.discountPricing.total;
            // caculate package pricing follow time-----------
            var packagePricingFollowTime = packagePricing * packageCount;
            // caculate time----------------------------------
            var subtractTime = moments(endTime).diff(moments(startTime))
            var durationTimeDetails = moments.duration(subtractTime);
            var durationTime = durationTimeDetails.hours() + ":" + durationTimeDetails.minutes();
            // caculate total price--------------------------- 
            var payAmount = packagePricingFollowTime + servicePricing - discountPricing;
            var data = {
              checkinTime: StartTimeString,
              checkoutTime: strEndTimeString,
              packageType: packageType,
              packageRate: packageRate,
              durationTime: durationTime,
              packagePricing: packagePricingFollowTime,
              servicePricing: servicePricing,
              discountAmount: discountPricing,
              totalPrice: payAmount
            };
            res.success(data);
          }
        });
    }, function (error) {
      res.error(error);
    });
  } else {
    res.success({});
  }
});

function getServices(_serviceArr) {
  var servicesQuery = new Parse.Query('Service');
    servicesQuery.include('servicePackage');
    servicesQuery.containedIn('objectId', _serviceArr);
    return servicesQuery.find();
}
