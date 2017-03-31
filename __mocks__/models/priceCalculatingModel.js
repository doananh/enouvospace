var Tool      = require('./../../cloud/utils/tools.js');
var moments   = require('moment');
var MockData  = require('../data');

function getDiscountPriceByType (_type) {
  return MockData.DISCOUNT_PRICE_RESULT[_type];
}

function getPackagePriceByType (_type) {
  return MockData.PACKAGE_PRICE_RESULT[_type];
}

function getServicePriceByType (_type) {
  return MockData.SERVICE_PRICE_RESULT[_type];
}

function getBookingByType (_type) {
  return MockData.BOOKINGS[_type];
}

function getBookingPricingDetail (_type) {
  return new Promise((resolve, reject) =>  {
    var packagePricing = getPackagePriceByType(_type);
    var servicePricing = getServicePriceByType(_type);
    var discountPricing = getDiscountPriceByType(_type);
    var booking = getBookingByType(_type);
    var payAmount = packagePricing.total - discountPricing.total + servicePricing.total;
    resolve({
      packagePricing: packagePricing,
      servicePricing: servicePricing,
      discountPricing: discountPricing,
      validTime: {
        startTime: booking.startTime,
        endTime: booking.endTime,
      },
      packageCount: booking.packageCount,
      numOfUsers: booking.numOfUsers,
      payAmount: payAmount
    });
  }, function (error) {
    reject(error);
  });
}

const priceMock = jest.genMockFromModule('./priceCalculatingModel');

priceMock.getDiscountPriceByType   = getDiscountPriceByType;
priceMock.getPackagePriceByType    = getPackagePriceByType;
priceMock.getServicePriceByType    = getServicePriceByType;
priceMock.getBookingPricingDetail  = getBookingPricingDetail;

module.exports = priceMock;
