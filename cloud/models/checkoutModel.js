var _ = require('underscore');
var moment   = require('moment');
var Constants = require('../constant.js');
var Tool      = require('../utils/tools.js');

function formatResponseData (_priceDetail) {
  return new Promise((resolve, reject) => {
    if (_priceDetail) {
      if (!_priceDetail.validTime || !_priceDetail.packagePricing) {
        return reject('Cannot format checkout data');
      }

      var startTime   = _priceDetail.validTime.startTime;
      var endTime     = _priceDetail.validTime.endTime;
      var packageType = _priceDetail.packagePricing.package.type;
      var duration              = Tool.getDurationDetail(startTime, endTime, packageType);
      var packageAmountString   = Tool.formatToVNDString(_priceDetail.packagePricing.total);
      var discountAmountString  = Tool.formatToVNDString(_priceDetail.discountPricing.total);
      var serviceAmountString   = Tool.formatToVNDString(_priceDetail.servicePricing.total);
      var totalPriceString      = Tool.formatToVNDString(_priceDetail.payAmount);
      var chargeRateString      = Tool.formatToVNDString(_priceDetail.packagePricing.package.chargeRate);
      var userData = {

        username: _priceDetail.user.username,
        type: _priceDetail.user.type
      }
      if (_priceDetail.user.code) {
        userData.code = _priceDetail.user.code;
      }
      if (_priceDetail.user.id) {
        userData.id = _priceDetail.user.id;
      }

      return resolve({
        customerName: _priceDetail.user.username,
        customerCode: _priceDetail.user.code,
        checkinTime: startTime.toISOString(),
        checkoutTime: endTime.toISOString(),
        duration: {
          text: duration.text,
          value: duration.value
        },
        package: {
          name: _priceDetail.packagePricing.package.name,
          chargeRate: {
            text: chargeRateString,
            value: _priceDetail.packagePricing.package.chargeRate
          },
          amount: {
            value: _priceDetail.packagePricing.total,
          },
          count: _priceDetail.packageCount,
          type: _priceDetail.packagePricing.package.type,
          id: _priceDetail.packagePricing.package.id
        },
        serviceAmount: {
          text: serviceAmountString,
          value: _priceDetail.servicePricing.total
        },
        discountAmount: {
          text: discountAmountString,
          value: _priceDetail.discountPricing.total
        },
        numOfUsers: _priceDetail.numOfUsers,
        totalPrice: {
          text: totalPriceString,
          value: _priceDetail.payAmount
        },
        user: userData,
        bookingId: _priceDetail.bookingId
      });
    }
    else {
      return reject('data is undefined|null');
    }
  });
}

exports.formatResponseData = formatResponseData;
