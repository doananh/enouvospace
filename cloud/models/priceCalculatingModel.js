var moment = require('moment');
var _ = require('underscore');

var Tool          = require('./../utils/tools.js');
var DiscountModel = require('./discountModel.js');
var PackageModel  = require('./packageModel.js');
var Constants     = require('../constant.js');
var CheckoutModel = require('./checkoutModel.js');

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
    var id         = _package.objectId;
    var total      = calculatePackagePrice(_packageCount, chargeRate, _numberOfUsers);
    result.package = {name: name, chargeRate: chargeRate, type: type, id: id};
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
      var item           = {unit: servicePackage.unit, count: count, chargeRate: servicePackage.chargeRate, type: servicePackage.type};
      totalPrice        += count * servicePackage.chargeRate;
      result.items.push(item);
    });
    result.total = totalPrice;
  }

  return result;
}

function shouldChangeToDayPackage (_packageObject, _packageCount, _startTime) {
  return new Promise((resolve, reject) => {
    var packageType = _packageObject.type;
    if (packageType === 'HOUR') {
      var endTime       = Tool.getEndTimeFromPackage(_startTime, packageType, null);
      var duration      = moment.duration(moment(endTime).diff(moment(_startTime)));
      var packageCount  = duration.asHours();
      if (packageCount >= Constants.CHANGE_HOUR_TO_DAY_PACKAGE) {
        PackageModel.getPackageByType('DAY')
        .then( function (packageObject) {
            return resolve({
              packageObject: packageObject,
              packageCount: 1,
              startTime: _startTime,
              endTime: endTime
            });
        })
        .catch( function (error) {
          return reject(error);
        })
      }
      else {
        return resolve({
          packageObject: _packageObject,
          packageCount: packageCount,
          startTime: _startTime,
          endTime: endTime
        });
      }
    }
    else {
      var endTime   = Tool.getEndTimeFromPackage(_startTime, _packageObject.type, _packageCount);
      var fixTime   = Tool.fixOpenAndCloseTime(packageType, _startTime, endTime);

      return resolve({
        packageObject: _packageObject,
        packageCount: _packageCount,
        startTime: fixTime.openTime,
        endTime: fixTime.closeTime
      });
    }
  });
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

    shouldChangeToDayPackage(packageObject, packageCount, startTime)
    .then( function (afterChangeData) {
      packageCount  = afterChangeData.packageCount;
      packageObject = afterChangeData.packageObject;
      startTime     = afterChangeData.startTime;
      endTime       = afterChangeData.endTime;
      // ------------------------------------------------
      var servicesQuery     = new Parse.Query('Service');
      servicesQuery.include('servicePackage');
      servicesQuery.equalTo('booking', bookingPointer);
      return servicesQuery.find();
    })
    .then( function (services) {
      var servicePricing = getServicePricingDetail(services);
      return servicePricing;
    })
    .then( function (servicePricing) {
          var packagePricing  = getPackagePricingDetail(packageObject, packageCount, numOfUsers);
          var packageAmount   = packagePricing.total;
          var discountPricing = getDiscountDetailPricing(null, packageAmount); // temp remove discount
          var payAmount       = servicePricing.total + packagePricing.total - discountPricing.total;
          return {
            user: user,
            servicePricing: servicePricing,
            packagePricing: packagePricing,
            discountPricing: discountPricing,
            validTime: {
              startTime: startTime,
              endTime: endTime,
            },
            packageCount: packageCount,
            numOfUsers: numOfUsers,
            payAmount: payAmount,
            bookingId: _booking.id
          };
    })
    .then( function(priceDetail) {
      var formatResponseData = CheckoutModel.formatResponseData(priceDetail);
      return resolve(formatResponseData);
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
