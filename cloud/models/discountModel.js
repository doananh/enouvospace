var Tool    = require('./../utils/tools.js');
var moments = require('moment');
var _       = require('underscore');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL

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
