var Tool    = require('./../utils/tools.js');
var moments = require('moment');
var _       = require('underscore');

function getDiscountByTimeAndPackage (_package, _time) {
  return new Promise((resolve, reject) => {
    var discountQuery = new Parse.Query("Discount");
    discountQuery.lessThanOrEqualTo("startTime", _time);
    discountQuery.greaterThanOrEqualTo("endTime", _time);
    discountQuery.equalTo("status", "OPEN");
    discountQuery.first().then(function(discounts) {
      resolve(discounts);
    }, function (error) {
      reject(error);
    });
  }, function (error) {
    reject(error);
  });
}

exports.getDiscountByTimeAndPackage = getDiscountByTimeAndPackage;
