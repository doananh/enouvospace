var Tool = require('./Tool');

function getDiscountDetailPricing (_discount, _packageAmount) {
  var result = {total: 0, percent: 0, amount: 0};
  if (_discount) {
    var discount = _discount.toJSON();
    var percent = discount.percent;
    var amount  = discount.amount;
    if (percent && (percent > 0)) {
      result.percent = percent;
      result.total = _packageAmount * percent * 0.01;
    }
    else if (amount && (amount > 0)) {
      result.amount = amount;
      result.total = amount;
    }
  }

  return result;
}

function getPackagePricingDetail (_package, _packageCount, _numberOfUsers) {
  var result = {total: 0, package: {}, count: _packageCount, numOfUsers: _numberOfUsers};
  if (_package)  {
    var chargeRate = _package.get('chargeRate');
    var name       = _package.get('name');
    var currency   = _package.get('unit');
    var total      = calculatePackagePrice(_packageCount, chargeRate, _numberOfUsers);
    result.package = { currency: currency, name: name, chargeRate: chargeRate, total: total };
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
      var item           = { unit: servicePackage.unit, count: count, chargeRate: servicePackage.chargeRate };
      totalPrice        += count * servicePackage.chargeRate;
      result.items.push(item);
    });
    result.total = totalPrice;
  }

  return result;
}

exports.getPackagePricingDetail = getPackagePricingDetail;
exports.getServicePricingDetail = getServicePricingDetail;
exports.getDiscountDetailPricing = getDiscountDetailPricing;
