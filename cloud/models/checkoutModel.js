var _ = require('underscore');
var moment   = require('moment');
var Constants = require('../constant.js');
var Tool      = require('../utils/tools.js');

function formatResponseData (_priceDetail) {
    if (_priceDetail) {
      var startTime   = _priceDetail.startTime;
      var endTime     = _priceDetail.endTime;
      var checkinTime = _priceDetail.checkinTime;

      var displayName = _priceDetail.packagePricing.package.packageType.displayName;
      var packageType = Tool.getPackageType(displayName);

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

      return {
        customerName: _priceDetail.user.username,
        customerCode: _priceDetail.user.code,
        checkinTime: checkinTime ? checkinTime.toISOString() : startTime.toISOString(),
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
          id: _priceDetail.packagePricing.package.objectId
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
      }
    }
    else {
      throw ('cannot format empty data');
    }
}

exports.formatResponseData = formatResponseData;
