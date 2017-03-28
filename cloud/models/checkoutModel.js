var _ = require('underscore');
var moments = require('moment');
var Constants = require('../constant');

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
      var packageAmountString   = _priceDetail.packagePricing.total.toFixed(4) + " " + Constants.CURRENCY_UNIT;
      var discountAmountString  = _priceDetail.discountPricing.total.toFixed(4) + " " + Constants.CURRENCY_UNIT;
      var serviceAmountString   = _priceDetail.servicePricing.total.toFixed(4) + " " + Constants.CURRENCY_UNIT;
      var totalPriceString      = _priceDetail.payAmount.toFixed(4) + " " + Constants.CURRENCY_UNIT;
      return resolve({
        customerName: _priceDetail.user.username,
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
        }
      });
    }
    else {
      return reject('data is undefined|null');
    }
  });
}

exports.formatResponseData = formatResponseData;
