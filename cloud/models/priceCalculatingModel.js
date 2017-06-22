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
        result.percent  = percent;
        var total       = _packageAmount * percent * 0.01;
        var roundedTotal = +total.toFixed(2);
        result.total   = roundedTotal || total;
      }
      else if (amount && (amount > 0)) {
        result.amount = amount;
        var roundedTotal  = +amount.toFixed(2);
        result.total      = roundedTotal || amount;
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
      var numOfUsers = _numberOfUsers;
      var isPaidOnPersons = _package.isPaidOnPersons;
      if ( !_.isUndefined(isPaidOnPersons) &&  !_.isNull(isPaidOnPersons) && !isPaidOnPersons) {
        numOfUsers = 1;
      }
      var total      = calculatePackagePrice(_packageCount, chargeRate, numOfUsers);
      var roundedTotal = +total.toFixed(2);
      result.package = _package;
      result.total   = roundedTotal || total;
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
      var roundedTotal = +totalPrice.toFixed(2);
      result.package = _package;
      result.total   = roundedTotal || total;
    }

    return result;
}

function shouldChangeToDayPackage (_package, _startTime, _endTime, _packageCount, _bookingId) {
    return new Promise((resolve, reject) => {
        var packageTypeName = _package.packageType.name;
        var packageType     = packageTypeName && packageTypeName.toUpperCase();
        if (packageType === 'HOURLY') {
          RecordModel.getRecordByParams({bookingId: _bookingId})
          .then(function (recordData) {
              var checkinTime = recordData && recordData.get('checkinTime');
              var startTime   = checkinTime || _startTime;
              var endTime     = _endTime || moment().toDate();
              var duration    = moment.duration(moment(endTime).diff(moment(startTime)));
              var hours       = duration.asHours();
              return resolve({
                packageObject: _package,
                packageCount: hours,
                startTime: _startTime,
                endTime: endTime,
                checkinTime: checkinTime
              });
          });
        }
        else if (packageType === 'DAILY') {
          var format           = 'YYYY-MM-DD';
          var strFormatedStart = moment(_startTime).format(format);
          var strFormatedEnd   = moment(_endTime).format(format);
          var mStartTime       = moment(strFormatedStart);
          var mEndTime         = moment(strFormatedEnd);
          var dayCount         = Tool.getWorkDay(mStartTime, mEndTime);
          return resolve({
            packageObject: _package,
            packageCount: dayCount,
            startTime: _startTime,
            endTime: _endTime
          });
        }
        else if (packageType) {
          var endTime   = Tool.getEndTimeFromPackage(_startTime, packageType, _packageCount);
          var fixTime   = Tool.fixOpenAndCloseTime(packageType, _startTime, endTime);
          console.log(_packageCount);
          return resolve({
            packageObject: _package,
            packageCount: _packageCount,
            startTime: fixTime.openTime,
            endTime: fixTime.closeTime
          });
        }
        else {
          return reject('Invalid package type params');
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
      var discountAmount  = bookingObject.get('discountAmount');
      var downPayment  = bookingObject.get('downPayment');
      var checkinTime     = bookingObject.get('startTime'); // this for fixing hourly price with checkinTime - not startTime

      shouldChangeToDayPackage(packageObject, startTime, endTime, packageCount, bookingId)
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
          // var discountPricing = getDiscountDetailPricing(null, packageAmount); // temp remove discount
          var payAmount       = servicePricing.total + packageAmount - discountAmount - downPayment;
          var formatedPayAmout =  Tool.formatToVNDValue(payAmount);

          return resolve({
              user: user,
              servicePricing: servicePricing,
              packagePricing: packagePricing,
              discountPricing: discountAmount,
              downPayment: downPayment,
              startTime: startTime,
              checkinTime: checkinTime,
              endTime: endTime,
              numOfUsers: numOfUsers,
              packageCount: packageCount,
              bookingId: bookingId,
              payAmount: formatedPayAmout,
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

function checkPricing (_bookingParams) {
  return new Promise((resolve, reject) => {
      var packageId = _bookingParams.packageId;
      PackageModel.getPackageById(packageId)
      .then(function (packageData) {
          var isPaidOnPersons = packageData.get('isPaidOnPersons');
          var numOfUsers    = _bookingParams.numOfUsers;
          var packageCount  = _bookingParams.packageCount;
          var startTime     = _bookingParams.startTime;
          var endTime       = _bookingParams.endTime;
          var mNow          = moment();
          if (moment(endTime).isBefore(moment(startTime))) {
            throw('Please choose end time is after start time');
          }
          if (moment(startTime).isBefore(mNow)) {
            throw('Start time can\'t be in the past');
          }

          if ( !_.isUndefined(isPaidOnPersons) &&  !_.isNull(isPaidOnPersons) && !isPaidOnPersons) {
            numOfUsers = 1;
          }
          if (packageData) {
            var chargeRate      = packageData.get('chargeRate');
            var packageTypeName = packageData.get('packageType') && packageData.get('packageType').name;
            var packageType     = packageTypeName && packageTypeName.toUpperCase();
            if (packageType === 'HOURLY') {
              if (endTime) {
                var duration  = moment.duration(moment(endTime).diff(moment(startTime)));
                var hours     = duration.asHours();
                if (hours < 1) {
                  throw('Number of hours should be more than one');
                }
                var price     = hours * chargeRate * numOfUsers;
                var message   = Tool.formatToVNDString(price);
                return resolve({text: message, price: price.toFixed(2)})
              }
              else {
                var message = Tool.formatToVNDString(chargeRate);
                return resolve({text: message + ' / HOUR'});
              }
            }
            else if (packageType === 'DAILY') {
              var format           = 'YYYY-MM-DD';
              var strFormatedStart = moment(startTime).format(format);
              var strFormatedEnd   = moment(endTime).format(format);
              var mStartTime       = moment(strFormatedStart);
              var mEndTime         = moment(strFormatedEnd);
              var dayCount  = Tool.getWorkDay(mStartTime, mEndTime);
              var price     = dayCount * chargeRate * numOfUsers;
              var message   = Tool.formatToVNDString(price);
              return resolve({text: message, price: price.toFixed(2)})
            }
            else if (packageType) {
              if (packageCount) {
                var price     = packageCount * chargeRate * numOfUsers;
                var message   = Tool.formatToVNDString(price);
                return resolve({text: message, price: price.toFixed(2)})
              }
              else {
                throw('Require number of packages params');
              }
            }
            else {
              throw('No package type data found');
            }
          }
          else {
            throw('No package data found');
          }
      })
      .catch(function (error) {
          return reject(error);
      });
  });
}

exports.calculateBookingPricing   = calculateBookingPricing;
exports.previewPricing            = previewPricing;
exports.checkPricing              = checkPricing;
