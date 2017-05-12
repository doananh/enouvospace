var moment = require('moment');
var _ = require('underscore');

var Tool          = require('./../utils/tools.js');
var DiscountModel = require('./discountModel.js');
var PackageModel  = require('./packageModel.js');
var Constants     = require('../constant.js');
var CheckoutModel = require('./checkoutModel.js');
var RecordModel   = require('./recordModel.js');

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
      var venue      = _package.venue;
      var id         = _package.objectId;
      var total      = calculatePackagePrice(_packageCount, chargeRate, _numberOfUsers);
      result.package = _package;
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

function shouldChangeToDayPackage (_packageObject, _packageCount, _startTime, bookingId) {
    return new Promise((resolve, reject) => {
        const displayName = _packageObject.packageType.displayName;
        var packageType = Tool.getPackageType(displayName);
        if (packageType === 'HOURLY') {
          RecordModel.getRecordByParams({bookingId: bookingId})
          .then(function (recordData) {
              var checkinTime = recordData && recordData.get('checkinTime');

              var endTime       = Tool.getEndTimeFromPackage(checkinTime || _startTime, packageType, null);
              var duration      = moment.duration(moment(endTime).diff(moment(checkinTime || _startTime)));
              var packageCount  = duration.asHours();
              /* temp remove
              if (packageCount >= Constants.CHANGE_HOUR_TO_DAY_PACKAGE) {
                ///
              }
              else {
                ///
              }*/
              return resolve({
                packageObject: _packageObject,
                packageCount: packageCount,
                startTime: _startTime,
                endTime: endTime,
                checkinTime: checkinTime
              });
          });
        }
        else {
          var endTime   = Tool.getEndTimeFromPackage(_startTime, packageType, _packageCount);
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

function calculateBookingPricing (bookingObject) {
    return new Promise((resolve, reject) => {
      var bookingId       = bookingObject.id;
      var packageObject   = bookingObject.get('package');
      var packageCount    = bookingObject.get('packageCount');
      var numOfUsers      = bookingObject.get('numOfUsers');
      var startTime       = bookingObject.get('startTime');
      var endTime         = bookingObject.get('endTime');
      var user            = bookingObject.get('user');
      var status          = bookingObject.get('status');
      var isPaid          = bookingObject.get('isPaid');
      var checkinTime     = bookingObject.get('startTime'); // this for fixing hourly price with checkinTime - not startTime


      shouldChangeToDayPackage(packageObject, packageCount, startTime, bookingId)
      .then(function (afterChangeData) {
          packageCount  = afterChangeData.packageCount;
          packageObject = afterChangeData.packageObject;
          startTime     = afterChangeData.startTime;
          endTime       = afterChangeData.endTime;
          if (afterChangeData.checkinTime) {
            checkinTime = afterChangeData.checkinTime;
          }
          // ------------------------------------------------
          var servicesQuery     = new Parse.Query('Service');
          servicesQuery.include('servicePackage');
          servicesQuery.equalTo('booking', { __type: 'Pointer', className: 'Booking',objectId: bookingId });
          return servicesQuery.find();
      })
      .then(function (services) {
          return getServicePricingDetail(services);
      })
      .then(function (servicePricing) {
          var packagePricing  = getPackagePricingDetail(packageObject, packageCount, numOfUsers);
          var packageAmount   = packagePricing.total;
          var discountPricing = getDiscountDetailPricing(null, packageAmount); // temp remove discount
          var payAmount       = servicePricing.total + packageAmount - discountPricing.total;

          return resolve({
              user: user,
              servicePricing: servicePricing,
              packagePricing: packagePricing,
              discountPricing: discountPricing,
              startTime: startTime,
              checkinTime: checkinTime,
              endTime: endTime,
              numOfUsers: numOfUsers,
              packageCount: packageCount,
              bookingId: bookingId,
              payAmount: payAmount,
              status: status
          });
      })
      .catch(function (error) {
          return reject(error);
      });
    });
}

function previewPricing (bookingObject) {
  return new Promise((resolve, reject) => {
      calculateBookingPricing(bookingObject)
      .then(function (response) {
          var formatResponseData = CheckoutModel.formatResponseData(response);
          return resolve(formatResponseData);
      })
      .catch(function (error) {
          return reject(error);
      });
  });
}

exports.calculateBookingPricing   = calculateBookingPricing;
exports.previewPricing            = previewPricing;
