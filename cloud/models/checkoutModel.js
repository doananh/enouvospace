var _ = require('underscore');
var moments   = require('moment');
var Constants = require('../constant');
var Tool      = require('../utils/tools');

function formatResponseData (_priceDetail) {
  return new Promise((resolve, reject) => {
    if (_priceDetail) {
      if (!_priceDetail.validTime || !_priceDetail.packagePricing) {
        return reject('Cannot format checkout data');
      }

      var startTime = _priceDetail.validTime.startTime;
      var endTime   = _priceDetail.validTime.endTime;
      var subtractTime          = moments(endTime).diff(moments(startTime))
      var durationTimeDetails   = moments.duration(subtractTime);
      var hourString            = (durationTimeDetails.hours() > 1) ? " hours " : " hour ";
      var minuteString          = (durationTimeDetails.minutes() > 1) ? " minutes " : " minute";
      var durationInString      = durationTimeDetails.hours() + hourString + durationTimeDetails.minutes() + minuteString;
      var durationInMinutes     = durationTimeDetails.hours() * 60 + durationTimeDetails.minutes();
      var packageAmountString   = Tool.formatToVNDString(_priceDetail.packagePricing.total);
      var discountAmountString  = Tool.formatToVNDString(_priceDetail.discountPricing.total);
      var serviceAmountString   = Tool.formatToVNDString(_priceDetail.servicePricing.total);
      var totalPriceString      = Tool.formatToVNDString(_priceDetail.payAmount);
      return resolve({
        customerName: _priceDetail.user.username,
        customerCode: _priceDetail.user.code,
        checkinTime: startTime,
        checkoutTime: endTime,
        duration: {
          text: durationInString,
          value: durationInMinutes
        },
        package: {
          name: _priceDetail.packagePricing.package.name,
          chargeRate: _priceDetail.packagePricing.package.chargeRate,
          amount: {
            text: packageAmountString,
            value: _priceDetail.packagePricing.total
          }
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
      });
    }
    else {
      return reject('data is undefined|null');
    }
  });
}

exports.formatResponseData = formatResponseData;
