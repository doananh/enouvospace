var _ = require('underscore');
var moments = require('moment');
var pricingService = require('./PricingService');

Parse.Cloud.define("checkout", function(req, res) {
  var params = req.params;
  if (params && params.code) {
    getAnonymousUserInBooking(params)
    .then(function (bookingData) {
        const servicePointers = bookingData.get('services');
        var serviceArr = servicePointers ? servicePointers.map(function(e) {return e.id}) : [];
        var servicesQuery = new Parse.Query('Service');
        servicesQuery.include('servicePackage');
        servicesQuery.containedIn('objectId', serviceArr);
        servicesQuery.find().then(function(services) {
          var servicePricing = pricingService.getServicePricingDetail(services);
          return servicePricing;
        }).then(function (serviceResult) {

          // calculate package price -------------------
          var packagePointer  = bookingData.get('package');
          var packageCount    = bookingData.get('packageCount');
          var numOfUsers      = bookingData.get('numOfUsers');
          var startTime       = bookingData.get('startTime');
          var packagePricing  = pricingService.getPackagePricingDetail(packagePointer, packageCount, numOfUsers);
          // calculate discount price ------------------
          var discountPointer = bookingData.get('discount');
          packageAmount       = packagePricing.total;
          var discountPricing = pricingService.getDiscountDetailPricing(discountPointer, packageAmount);
          // calculate duration time --------------
          var subtractTime = moments().diff(moments(startTime));
          var durationTimeDetails = moments.duration(subtractTime);
          var durationTime = durationTimeDetails.hours() + ":" + durationTimeDetails.minutes();
          var discountAmount = bookingData.get("discountAmount");
          var packageData = bookingData.get("package").toJSON();
          var packageType = packageData.type;
          var packageRate = packageData.chargeRate;
          //calculate total price ----------------
          var payAmount       = (serviceResult.total + packagePricing.total - discountPricing.total)*(parseInt(durationTimeDetails.hours())+parseInt(durationTimeDetails.minutes())/60);
          var data = {
            checkinTime: startTime,
            checkoutTime: moments().toDate(),
            packageType: packageType,
            packageRate: packageRate,
            durationTime: durationTime,
            discountAmount: discountAmount,
            totalPrice: payAmount 
          };
          res.success(data);
        }, function (error) {
          res.error(error);
        });
    }, function (error) {
      res.error(error);
    });
  } else {
    res.success({});
  }
  
});

function getAnonymousUserInBooking (_params) {
  var bookingQuery = new Parse.Query("Booking");
    bookingQuery.equalTo("code", _params.code);
    bookingQuery.include("package");
    bookingQuery.include('discount');
  return  bookingQuery.first();
}