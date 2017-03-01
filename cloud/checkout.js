var _ = require('underscore');
var moments = require('moment');
var PriceCalculatingUtil = require('./util/PriceCalculatingUtil');
var BookingUtil        = require('./util/BookingUtil');

Parse.Cloud.define("checkout", function(req, res) {
  var params = req.params;
  if (params && params.code) {
    BookingUtil.getAnonymousUserInBooking(params)
    .then(function (bookingData) {
        const servicePointers = bookingData.get('services');
        var serviceArr = servicePointers ? servicePointers.map(function(e) {return e.id}) : [];
        var servicesQuery = new Parse.Query('Service');
        servicesQuery.include('servicePackage');
        servicesQuery.containedIn('objectId', serviceArr);
        servicesQuery.find().then(function(services) {
          var servicePricing = PriceCalculatingUtil.getServicePricingDetail(services);
          return servicePricing;
        }).then(function (serviceResult) {

          // calculate package price -------------------
          var packagePointer  = bookingData.get('package');
          var packageCount    = bookingData.get('packageCount');
          var numOfUsers      = bookingData.get('numOfUsers');
          var startTime       = bookingData.get('startTime');
          var endTime         = (bookingData.get('endTime')) ? bookingData.get('endTime') : moments().toDate();
          var packagePricing  = PriceCalculatingUtil.getPackagePricingDetail(packagePointer, packageCount, numOfUsers);
          // calculate discount price ------------------
          var discountPointer = bookingData.get('discount');
          packageAmount       = packagePricing.total;
          var discountPricing = PriceCalculatingUtil.getDiscountDetailPricing(discountPointer, packageAmount);
          // calculate duration time --------------
          var subtractTime = moments(endTime).diff(moments(startTime));
          var durationTimeDetails = moments.duration(subtractTime);
          var durationTime = durationTimeDetails.hours() + ":" + durationTimeDetails.minutes();
          var discountAmount = bookingData.get("discountAmount");
          var packageData = bookingData.get("package").toJSON();
          var packageType = packageData.type;
          var packageRate = packageData.chargeRate;
          //calculate total price ----------------
          var payAmount   = (serviceResult.total + packagePricing.total - discountPricing.total) * (parseInt(durationTimeDetails.hours()) + parseInt(durationTimeDetails.minutes())/60);
          var data = {
            checkinTime: startTime,
            checkoutTime: moments(endTime).toDate(),
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
