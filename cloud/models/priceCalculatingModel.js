var moment = require('moment');
var _ = require('underscore');

var Tool = require('./../utils/tools.js');
var DiscountModel = require('./discountModel.js');

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
    var chargeRate = _package.chargeRate;
    var name       = _package.name;
    var type       = _package.type;
    var total      = calculatePackagePrice(_packageCount, chargeRate, _numberOfUsers);
    result.package = {name: name, chargeRate: chargeRate, type: type};
    result.total   = total;
  }

  return result;
}

function calculatePackagePrice (_packageCount, _chargeRate, _numberOfUsers) {
  // const ceilValue = Math.ceil(_packageCount);
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
      var item           = {unit: servicePackage.unit, count: count, chargeRate: servicePackage.chargeRate, type: servicePackage.type};
      totalPrice        += count * servicePackage.chargeRate;
      result.items.push(item);
    });
    result.total = totalPrice;
  }

  return result;
}

function getBookingPricingDetail (_booking) {
  return new Promise((resolve, reject) => {
    var bookingPointer    = {
      __type: 'Pointer',
      className: 'Booking',
      objectId: _booking.id
    }
    var packageObject   = _booking.get('package');
    var packageCount    = _booking.get('packageCount');
    var numOfUsers      = _booking.get('numOfUsers');
    var startTime       = _booking.get('startTime');
    var endTime         = _booking.get('endTime');
    var user            = _booking.get('user');
    var servicesQuery     = new Parse.Query('Service');
    servicesQuery.include('servicePackage');
    servicesQuery.equalTo('booking', bookingPointer);

    if (packageObject.type === 'HOUR') {
      endTime = Tool.getEndTimeFromPackage(startTime, packageObject.type, null);
      packageCount = moment(endTime).diff(moment(startTime), 'hours', true);
    }
    else {
      endTime = Tool.getEndTimeFromPackage(startTime, packageObject.type, packageCount);
    }
    /// --------------------------------------------
    servicesQuery.find().then( function (services) {
      var servicePricing = getServicePricingDetail(services);
      return servicePricing;
    })
    .then( function (serviceResult) {
        if (user.type === "anonymous") {
          var packagePricing  = getPackagePricingDetail(packageObject, packageCount, numOfUsers);
          var packageAmount   = packagePricing.total;
          var discountPricing = getDiscountDetailPricing(null, packageAmount); // temp remove discount
          var payAmount       = serviceResult.total + packagePricing.total - discountPricing.total;
          // // Pricing details
          return resolve({
            user: user,
            servicePricing: serviceResult,
            packagePricing: packagePricing,
            discountPricing: discountPricing,
            validTime: {
              startTime: startTime,
              endTime: endTime,
            },
            packageCount: packageCount,
            numOfUsers: numOfUsers,
            payAmount: payAmount
          });
        }
        else if (type === "customer") {
          return resolve({});
        }
        else {
          return resolve({});
        }
    })
    .catch( function (error) {
      return reject(error);
    });
  });
}

exports.getBookingPricingDetail   = getBookingPricingDetail;
exports.getPackagePricingDetail   = getPackagePricingDetail;
exports.getServicePricingDetail   = getServicePricingDetail;
exports.getDiscountDetailPricing  = getDiscountDetailPricing;
