var _ = require('underscore');
var moments = require('moment');
var PriceCalculatingUtil = require('./models/priceCalculatingModel');
var BookingUtil        = require('./models/bookingModel');

Parse.Cloud.define("checkout", function(req, res) {
  var params = req.params;
  if (params && params.code) {
    // ANONYMOUS CHECKOUT
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
              checkinTimeString: StartTimeString,
              checkoutTimeString: strEndTimeString,
              checkinTimeToDate: startTime,
              checkoutTimeToDate: endTime,
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
    //user checkout
    res.success({});
  }
});
