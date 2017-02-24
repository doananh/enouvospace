
var _ = require('underscore');
var tools = require('./tools');

Parse.Cloud.define('getPricingDetail', function(req, res) {
  var params = req.params;
  var UserId = params.UserId;
  var BookingId = params.BookingId;
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
        var servicePricing = getServicePricingDetail(services);
        return servicePricing;
      }).then(function (serviceResult) {

        // calculate package price -------------------
        var packagePointer  = booking.get('package');
        var packageCount    = booking.get('packageCount');
        var numOfUsers      = booking.get('numOfUsers');
        var startTime       = booking.get('startTime');
        var endTime         = booking.get('endTime');

        var packagePricing  = getPackagePricingDetail(packagePointer, packageCount, numOfUsers);
        // calculate discount price ------------------
        var discountPointer = booking.get('discount');
        packageAmount       = packagePricing.total;
        var discountPricing = getDiscountDetailPricing(discountPointer, packageAmount);
        var payAmount           = serviceResult.total + packagePricing.total - discountPricing.total;
        return {
          servicePricing: serviceResult,
          packagePricing: packagePricing,
          discountPricing: discountPricing,
          validTime: {
            startTime: tools.formatStringTime(startTime),
            endTime: tools.formatStringTime(endTime)
          },
          payAmount: payAmount
        };
      }).then(function (result) {
        return res.success(result);
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

function getDiscountDetailPricing (_discount, _packageAmount) {
  var result = {total: 0, percent: 0, amount: 0};
  if (_discount) {
    var percent = _discount.get('percent');
    var amount  = _discount.get('amount');
    if (percent && (percent > 0)) {
      result.percent = percent;
      result.total = _packageAmount * percent * 0.01;
    }
    else if (amount && (amount > 0)) {
      result.amount = amount;
      result.total = amount;
    }
  }
  return result;
}

function getPackagePricingDetail (_package, _packageCount, _numberOfUsers) {
  var result = {total: 0, package: {}, count: _packageCount, numOfUsers: _numberOfUsers};
  var chargeRate = _package.get('chargeRate');
  var name       = _package.get('name');
  var currency   = _package.get('unit');
  var totalPrice = chargeRate * _packageCount * _numberOfUsers;
  result.package['currency']    = currency;
  result.package['name']        = name;
  result.package['chargeRate']  = chargeRate;
  result.total                  = totalPrice;
  return result;
}

function getServicePricingDetail (_services) {
    var result = {total: 0, items: []};
    if (_services && _services.length) {
      var totalPrice = 0;
      var i = 0;
      var item = {};
      for (i = 0; i < _services.length; i++) {
        var servicePackage = _services[i].get('servicePackage');
        var count          = _services[i].get('count');
        totalPrice        += count * servicePackage.get('chargeRate');
        item.unit          = servicePackage.get('unit');
        item.count         = count;
        item.chargeRate    = servicePackage.get('chargeRate');
        result.items.push(item);
      }
      result.total = totalPrice;
    }
  return result;
}
