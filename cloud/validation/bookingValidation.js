
var _      = require('underscore');
var moment = require('moment');

var Constants = require('./../constant.js');
var PushApi   = require('./../notification/pushAPI.js');
var Mailgun = require('mailgun-js')({
    apiKey: process.env.EMAIL_API_KEY,
    domain: process.env.EMAIL_DOMAIN
});
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

  if ( _.isUndefined(packageCount) || _.isNull(packageCount) || (packageCount < 0)) {
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

  if (Constants.BOOKING_STATUSES.indexOf(status) < 0) {
    return res.error('Invalid status - please change it to OPEN or PENDING or CLOSED');
  }

  if (endTime && !pPackage.willPayWhenCheckout) {
    // temp remove for another bug about checkinTime & startTime - when checkinTime is early than startTime
    // if (moment(endTime).isBefore(startTime)) {
    //   return res.error('EndTime should be after StartTime');
    // }
  }

  if (!isNewBooking && (status !== "CLOSED") && (preStatus === "CLOSED")) {
    return res.error('Cannot OPEN a CLOSED booking');
  }

  if (!isNewBooking && (status !== preStatus)) {
    var message = "YOUR BOOKING HAS BEEN CHANGE FROM " + preStatus + " TO " + status;
    PushApi.notifyBookingChange(req.object.toJSON(), user, message);
  }

  return res.success();
});

Parse.Cloud.afterSave("Booking", function(request, response) {
  var isPreviousBooking  = request.original;
  var startTime = request.object.get('startTime');
  var htmlMail = htmlConvert.convert(request);
  if (!isPreviousBooking) {
    Mailgun.messages().send({
      to: process.env.EMAIL_FROM,
      from: process.env.EMAIL_FROM,
      subject: 'You have submitted booking in Enouvo Space at '+ moment(startTime).format('DD/MM/YYYY'),
      html: htmlMail,
    }, function (error, body) {
      if (error) {
          console.log("Uh oh, something went wrong");
      } else {
          console.log("Email sent!");
      }
    });
  }
})