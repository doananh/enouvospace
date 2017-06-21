var _ = require('underscore');
var moments = require('moment');

var Constants             = require('./constant');
var BookingModel          = require('./models/bookingModel.js');
var CheckoutModel         = require('./models/checkoutModel.js');
var PriceCalculatingModel = require('./models/priceCalculatingModel.js');
var userModel          = require('./models/userModel.js');

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

Parse.Cloud.define("updateBookingAndCheckingTable", function(req, res) {
    var params = req.params;
    BookingModel.updateBookingAndCheckingTable(params)
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

Parse.Cloud.define("approveBooking", function(req, res){
    BookingModel.changeStatusBooking({
        bookingId: req.params.bookingId,
        status: Constants.BOOKING_STATUSES[4]
    }).then(function(data){
        return res.success(data ? data.toJSON() : {});
    }).catch(function(error){
        return res.error(error);
    })
});

Parse.Cloud.define("rejectBooking", function(req, res){
  BookingModel.changeStatusBooking({
    bookingId: req.params.bookingId,
    status: Constants.BOOKING_STATUSES[3],
    hasCheckined: true
  }).then(function(bookingData){
    var user = bookingData.get("user");
    return userModel.getUserWithId(user.id)
  }).then(function (userData) {
    var email = userData.get('email');
    if (email) {
      var subject = 'You booking is cancelled. Please contact to our email: '+process.env.EMAIL_FROM;
      BookingModel.sendMail(email, process.env.EMAIL_FROM, subject, '<p>'+subject+'</p>');
    } else {
      console.log("Require email");
    }
    return res.success(bookingData ? bookingData.toJSON() : {});
  }).catch(function(error){
    return res.error(error);
  })
});