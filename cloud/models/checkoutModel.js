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
      var durationTime          = durationTimeDetails.hours() + hourString + durationTimeDetails.minutes() + minuteString;
      var packageAmountString   = _priceDetail.packagePricing.total.toFixed(4) + " " + Constants.CURRENCY_UNIT;
      var discountAmountString  = _priceDetail.discountPricing.total.toFixed(4) + " " + Constants.CURRENCY_UNIT;
      var serviceAmountString   = _priceDetail.servicePricing.total.toFixed(4) + " " + Constants.CURRENCY_UNIT;
      var totalPriceString      = _priceDetail.payAmount.toFixed(4) + " " + Constants.CURRENCY_UNIT;
      return resolve({
        checkinTimeToDate: startTime,
        checkoutTimeToDate: endTime,
        durationTime: durationTime,
        checkinTimeString: _priceDetail.validTime.StartTimeString,
        checkoutTimeString: _priceDetail.validTime.strEndTimeString,
        packageName: _priceDetail.packagePricing.package.name,
        packageChargeRate: _priceDetail.packagePricing.package.chargeRate,
        packageAmount:packageAmountString,
        serviceAmount: serviceAmountString,
        discountAmount: discountAmountString,
        numOfUsers: _priceDetail.numOfUsers,
        totalPrice: totalPriceString,
      });
    }
    else {
      return reject('data is undefined|null');
    }
  });
}

exports.formatResponseData = formatResponseData;
