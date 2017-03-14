var Tool      = require('./../../cloud/utils/tools');
var moments   = require('moment');
var MockData  = require('../data');

function getDiscountPriceByType (_type) {
  return MockData.DISCOUNT_PRICE_RESULT[_type];
}

function getPackagePriceByType (_type) {
  return MockData.PACKAGE_PRICE_RESULT[_type];;
}

function getServicePriceByType (_type) {
  return MockData.SERVICE_PRICE_RESULT[_type];
}

function getBookingPricingDetail (_booking) {
  return new Promise((resolve, reject) =>  {
    resolve({

    });
  }, function (error) {
    reject(error);
  });
}

var mocks = jest.genMockFromModule('./priceCalculatingModel');

mocks.getDiscountPriceByType   = getDiscountPriceByType;
mocks.getPackagePriceByType    = getPackagePriceByType;
mocks.getServicePriceByType    = getServicePriceByType;
mocks.getBookingPricingDetail  = getBookingPricingDetail;

module.exports = mocks;
