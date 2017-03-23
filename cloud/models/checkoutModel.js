var _ = require('underscore');
var moments = require('moment');

function formatResponseData (_priceDetail) {
  return new Promise((resolve, reject) => {
    if (_priceDetail) {
      if (!_priceDetail.validTime || !_priceDetail.packagePricing) {
        return reject('Cannot format checkout data');
      }

      var startTime = _priceDetail.validTime.startTime;
      var endTime   = _priceDetail.validTime.endTime;
      var subtractTime        = moments(endTime).diff(moments(startTime))
      var durationTimeDetails = moments.duration(subtractTime);
      var durationTime        = durationTimeDetails.hours() + ":" + durationTimeDetails.minutes();

      resolve({
        checkinTimeToDate: startTime,
        checkoutTimeToDate: endTime,
        durationTime: durationTime,
        checkinTimeString: _priceDetail.validTime.StartTimeString,
        checkoutTimeString: _priceDetail.validTime.strEndTimeString,
        packageName: _priceDetail.packagePricing.package.name,
        packageChargeRate: _priceDetail.packagePricing.package.chargeRate,
        packageAmount: _priceDetail.packagePricing.total,
        serviceAmount: _priceDetail.servicePricing.total,
        discountAmount: _priceDetail.discountPricing.total,
        totalPrice: _priceDetail.payAmount
      });
    }
    else {
      reject('data is undefined|null');
    }
  });
}

exports.formatResponseData = formatResponseData;
