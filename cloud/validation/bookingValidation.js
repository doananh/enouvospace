
var _      = require('lodash');
var moment = require('moment');

var Constants = require('../constant');
var PushApi   = require('./../notification/pushAPI.js');
var recordModal = require('../models/recordModel');
var userModel = require('./../models/userModel.js');
var bookingModel = require('./../models/bookingModel.js');
var PriceCalculatingModel = require('./../models/priceCalculatingModel.js');

var htmlConvert = require('./../emailTemplate/htmlConvert.js');

Parse.Cloud.beforeSave("Booking", function(req, res) {
  var user          = req.object.get('user');
  var packageCount  = req.object.get('packageCount');
  var pPackage      = req.object.get('package');
  var numOfUsers    = req.object.get('numOfUsers');
  var startTime     = req.object.get('startTime');
  var endTime       = req.object.get('endTime');
  var status        = req.object.get('status');
  var isNewBooking  = !req.object.id;
  var preStatus     = req.original && req.original.get('status');

  if (status === Constants.BOOKING_STATUSES[1] || status === Constants.BOOKING_STATUSES[3]) {
    req.object.set("endTime", moment().toDate());
  }

  if (_.isUndefined(user) || _.isEmpty(user)) {
    return res.error('Require user params');
  }

  if (user && !user.code && !user.id) {
    return res.error('Require code or id in user params');
  }

  if (user && user.code && user.id) {
    return res.error('only code or only id in user params');
  }

  if (user && user.id && !user.username) {
    return res.error('Require username in user');
  }

  if (user && user.code && (!_.isString(user.code) || (user.code.length < 4))) {
    return res.error('Invalid code format');
  }

  if (user && user.code && !user.username) {
    return res.error('Require username in user')
  }

  if ( _.isNumber(packageCount) && (packageCount < 0)) {
    return res.error('invalid number of package');
  }

  if (!pPackage) {
    res.error('Require package params');
  }

  if (_.isNull(startTime) || _.isUndefined(startTime)) {
    return res.error('Require start time params');
  }

  if (!_.isNumber(numOfUsers) || (numOfUsers <= 0)) {
    return res.error('Require number of users params');
  }

  if (_.indexOf(Constants.BOOKING_STATUSES, status) === -1) {
    return res.error('Invalid status - please change it to IN PROGRESS or PENDING or CLOSED');
  }

  if (endTime && !pPackage.willPayWhenCheckout) {
    // temp remove for another bug about checkinTime & startTime - when checkinTime is early than startTime
    // if (moment(endTime).isBefore(startTime)) {
    //   return res.error('EndTime should be after StartTime');
    // }
  }

  // if (!isNewBooking && (status !== "CLOSED") && (preStatus === "CLOSED")) {
  //   return res.error('Cannot IN PROGRESS a CLOSED booking');
  // }

  if (!isNewBooking && (status !== preStatus)) {
    var message = "YOUR BOOKING HAS BEEN CHANGE FROM " + preStatus + " TO " + status;
    PushApi.notifyBookingChange(req.object.toJSON(), user, message);
  }

  if (isNewBooking || !req.object.get('calculatedPrice')) {
    PriceCalculatingModel.calculateBookingPricing(req.object)
    .then(function (pricingDetail) {
        var calculatedPrice = pricingDetail.calculatedPrice;
        req.object.set("calculatedPrice", calculatedPrice);
        return res.success();
    })
    .catch(function (error) {
        return res.success();
    });
  }
  else {
    return res.success();
  }
});

Parse.Cloud.afterSave("Booking", function(request, response) {
  var isPreviousBooking  = request.original;
  var startTime = request.object.get('startTime');
  var user = request.object.get('user');
  var htmlMail = htmlConvert.convert(request);
  var status = request.object.get('status');
  if (status === "CANCELED") {
    bookingModel.updateRecordByBookingId(request.object)
    .then(function (data) {
      console.log('Update checkoutTime field in record successfully');
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  if (!isPreviousBooking && user && user.id) {
    userModel.getUserWithId(user.id)
    .then(function (data) {
      var email = data.get('email');
      if (email) {
        var subject = 'You have submitted booking in Enouvo Space at '+ moment(startTime).format('DD/MM/YYYY');
        bookingModel.sendMail(email, process.env.EMAIL_FROM, subject, htmlMail);
      } else {
        console.log("Require email");
      }
    })
    .catch(function (error) {
        console.log(error);
    });

    userModel.getAllAdmin()
    .then(function (data) {
      if (data && data.length > 0) {
        _.forEach(data, function(value) {
          var subject = 'You have got new booking from user '+user.name+'. Please approval booking in this user';
          bookingModel.sendMail(value.get('email'), process.env.EMAIL_FROM, subject, '<p>'+subject+'</p>');
        });
      } else {
        console.log("Require email");
      }
    })
    .catch(function (error) {
        console.log(error);
    });
  }
  //Update record for pre-booking
  if(request.object.get('hasCheckined') === false) {
    recordModal.createOrUpdateRecordForPreBooking(request.object.toJSON())
    .catch(function (error) {
        console.log(error);
    });
  }
})
