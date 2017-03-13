var Tool = require('./../../cloud/utils/tools');
var moments = require('moment');

function getDiscountDetailPricing (_discount, _packageAmount) {
  var result = {total: 0, percent: 0, amount: 0};
  return result;
}

function getPackagePricingDetail (_package, _packageCount, _numberOfUsers) {
  var result = {total: 0, package: {}, count: _packageCount, numOfUsers: _numberOfUsers};
  return result;
}

function calculatePackagePrice (_packageCount, _chargeRate, _numberOfUsers) {
  var res = _chargeRate * _packageCount * _numberOfUsers;
  return res;
}

function getServicePricingDetail (_services) {
  var result = {total: 0, items: []};
  return result;
}

function getBookingPricingDetail (_booking) {
  return new Promise((resolve, reject) => {
    resolve({});
  }, function (error) {
    reject(error);
  });
}

var mocks = jest.genMockFromModule('./priceCalculatingModel');

mocks.getBookingPricingDetail   = getBookingPricingDetail;
mocks.getPackagePricingDetail   = getPackagePricingDetail;
mocks.getServicePricingDetail   = getServicePricingDetail;
mocks.getDiscountDetailPricing  = getDiscountDetailPricing;

module.exports = mocks;
