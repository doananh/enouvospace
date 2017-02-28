var _     = require('underscore');
var Tool  = require('./util/Tool');
var PriceCalculatingUtil = require('./util/PriceCalculatingUtil');

Parse.Cloud.define('getPricingDetail', function(req, res) {
  var params    = req.params;
  var UserId    = params.UserId;
  var BookingId = params.BookingId; //"exxTso1mFU"
  /* 2 cases
    1. for anonymous - standard package hour
    2. *** for users - by package HOUR - DAY - WEEK - MONTH
       => require bookingId
       => return detail pricing
  */
  if (BookingId) {
    var bookingQuery = new Parse.Query('Booking');
    bookingQuery.equalTo('objectId', BookingId); //BookingId
    bookingQuery.include('package');
    bookingQuery.include('discount');
    bookingQuery.include('business');
    bookingQuery.first().then(function(booking) {
      // calculate service price ---------------------
      const servicePointers = booking.get('services');
      var serviceArr = servicePointers ? servicePointers.map(function(e) {return e.id}) : [];
      var servicesQuery = new Parse.Query('Service');
      servicesQuery.include('servicePackage');
      servicesQuery.containedIn('objectId', serviceArr);
      /// --------------------------------------------

      servicesQuery.find().then(function(services) {
        var servicePricing = PriceCalculatingUtil.getServicePricingDetail(services);
        return servicePricing;
      }).then(function (serviceResult) {

        // calculate package price -------------------
        var packagePointer  = booking.get('package');
        var packageCount    = booking.get('packageCount');
        var numOfUsers      = booking.get('numOfUsers');
        var startTime       = booking.get('startTime');
        var endTime         = booking.get('endTime');
        var packagePricing  = PriceCalculatingUtil.getPackagePricingDetail(packagePointer, packageCount, numOfUsers);

        // calculate discount price ------------------
        var discountPointer = booking.get('discount');
        packageAmount       = packagePricing.total;
        var discountPricing = PriceCalculatingUtil.getDiscountDetailPricing(discountPointer, packageAmount);
        var payAmount       = serviceResult.total + packagePricing.total - discountPricing.total;

        // Pricing details
        return res.success({
          servicePricing: serviceResult,
          packagePricing: packagePricing,
          discountPricing: discountPricing,
          validTime: {
            startTime: Tool.formatStringTime(startTime),
            endTime: Tool.formatStringTime(endTime)
          },
          payAmount: payAmount
        });
      }, function (error) {
        return res.error(err);
      });

    }, function (error) {
      return res.error(err);
    });
  }
  else {
    return res.success({});
  }
});
