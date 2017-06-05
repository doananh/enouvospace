var _ = require('underscore');
var moments = require('moment');

var BookingModel          = require('./models/bookingModel.js');
var CheckoutModel         = require('./models/checkoutModel.js');
var PriceCalculatingModel = require('./models/priceCalculatingModel.js');

Parse.Cloud.define("previewBooking", function(req, res) {
    var params = req.params;
    BookingModel.previewBooking(params)
    .then(function (bookingData) {
        return PriceCalculatingModel.previewPricing(bookingData);
    })
    .then(function (formatData) {
        return res.success(formatData);
    })
    .catch(function (error) {
        return res.error(error);
    });
});

Parse.Cloud.define("checkPricing", function(req, res) {
    var params = req.params;
    PriceCalculatingModel.checkPricing(params)
    .then(function (data) {
        return res.success(data);
    })
    .catch(function (error) {
        return res.error(error);
    });
});

Parse.Cloud.define("loadUserBooking", function(req, res) {
    var params = req.params;
    BookingModel.getUserBooking(params)
    .then(function (data) {
        var jsonData = _.map(data, function (element) {
          return element.toJSON();
        });
        return res.success(jsonData);
    })
    .catch(function (error) {
        return res.error(error);
    });
});

Parse.Cloud.define("getLastValidUserBooking", function(req, res) {
    var params  = req.params;
    var user    = params.user;
    BookingModel.getLastValidUserBooking({user: user})
    .then(function (bookingData) {
        return res.success(bookingData ? bookingData.toJSON() : {});
    })
    .catch(function (error) {
        return res.error(error);
    });
});
