var Tool = require('./Tool');

function getDiscountDetailPricing (_discount, _packageAmount) {
  var result = {total: 0, percent: 0, amount: 0};
  if (_discount) {
    var percent = _discount.get('percent');
    var amount  = _discount.get('amount');
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
  var chargeRate = _package.get('chargeRate');
  var name       = _package.get('name');
  var currency   = _package.get('unit');
  var totalPrice = chargeRate * _packageCount * _numberOfUsers;
  result.package['currency']    = currency;
  result.package['name']        = name;
  result.package['chargeRate']  = chargeRate;
  result.total                  = totalPrice;
  return result;
}

function getServicePricingDetail (_services) {
  var result = {total: 0, items: []};
  if (_services && _services.length) {
    var totalPrice = 0;
    var i = 0;
    for (i = 0; i < _services.length; i++) {
      var servicePackage = _services[i].get('servicePackage');
      var count          = _services[i].get('count');
      var item           = {};
      totalPrice        += count * servicePackage.get('chargeRate');
      item.unit          = servicePackage.get('unit');
      item.count         = count;
      item.chargeRate    = servicePackage.get('chargeRate');
      result.items.push(item);
    }
    result.total = totalPrice;
  }
  return result;
}

exports.getPackagePricingDetail = getPackagePricingDetail;
exports.getServicePricingDetail = getServicePricingDetail;
exports.getDiscountDetailPricing = getDiscountDetailPricing;
