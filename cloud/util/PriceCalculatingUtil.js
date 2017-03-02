var Tool = require('./Tool');
var moments = require('moment');

function getDiscountDetailPricing (_discount, _packageAmount) {
  var result = {total: 0, percent: 0, amount: 0};
  if (_discount) {
    var discount = _discount.toJSON();
    var percent = discount.percent;
    var amount  = discount.amount;
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
  if (_package)  {
    var chargeRate = _package.get('chargeRate');
    var name       = _package.get('name');
    var currency   = _package.get('unit');
    var total      = calculatePackagePrice(_packageCount, chargeRate, _numberOfUsers);
    result.package = { currency: currency, name: name, chargeRate: chargeRate};
    result.total   = total;
  }

  return result;
}

function calculatePackagePrice (_packageCount, _chargeRate, _numberOfUsers) {
  var res = _chargeRate * _packageCount * _numberOfUsers;
  return res;
}

function getServicePricingDetail (_services) {
  var result = {total: 0, items: []};
  if (_services && _services.length) {
    var totalPrice  = 0;
    _services.forEach(function(_service) {
      var service        = _service.toJSON();
      var servicePackage = service.servicePackage;
      var count          = service.count;
      var item           = { unit: servicePackage.unit, count: count, chargeRate: servicePackage.chargeRate };
      totalPrice        += count * servicePackage.chargeRate;
      result.items.push(item);
    });
    result.total = totalPrice;
  }

  return result;
}

function getBookingPricingDetail (_booking) {
  return new Promise((resolve, reject) => {
    // calculate service price ---------------------
    var servicePointers   = _booking.get('services');
    var serviceArr        = servicePointers ? servicePointers.map(function(e) {return e.id}) : [];
    var servicesQuery     = new Parse.Query('Service');
    servicesQuery.include('servicePackage');
    servicesQuery.containedIn('objectId', serviceArr);
    /// --------------------------------------------
    servicesQuery.find().then(function(services) {
      var servicePricing = getServicePricingDetail(services);
      return servicePricing;
    }).then(function (serviceResult) {
      // calculate package price -------------------
      var packagePointer  = _booking.get('package');
      var packageCount    = _booking.get('packageCount');
      var numOfUsers      = _booking.get('numOfUsers');
      var startTime       = _booking.get('startTime');
      var endTime         = _booking.get('endTime');
      var code            = _booking.get('code');
      if (code) {
        endTime       = moments().toDate();
        packageCount  = moments().diff(moments(startTime), 'hours', true);
      }

      var packagePricing  = getPackagePricingDetail(packagePointer, packageCount, numOfUsers);

      // calculate discount price ------------------
      var discountPointer = _booking.get('discount');
      packageAmount       = packagePricing.total;
      var discountPricing = getDiscountDetailPricing(discountPointer, packageAmount);
      var payAmount       = serviceResult.total + packagePricing.total - discountPricing.total;

      // Pricing details
      resolve({
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
      reject(error);
    });
  });
}

exports.getBookingPricingDetail = getBookingPricingDetail;
exports.getPackagePricingDetail = getPackagePricingDetail;
exports.getServicePricingDetail = getServicePricingDetail;
exports.getDiscountDetailPricing = getDiscountDetailPricing;
