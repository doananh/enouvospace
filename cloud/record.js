var _ = require('underscore');
var moment = require('moment');

var BookingModel  = require('./models/bookingModel.js');
var RecordModel   = require('./models/recordModel.js');

Parse.Cloud.define("recordCheckin", function(req, res) {
  var params    = req.params;
  var userId    = params.userId;
  var username  = params.username;
  BookingModel.getBookingByParams({ userId: userId, username: username, status: "OPEN", latest: true })
  .then(function (bookingData) {
      if (bookingData) {
        var startTime       = bookingData.get('startTime');
        var packageObject   = bookingData.get('package');
        var willPayWhenCheckout = packageObject.willPayWhenCheckout;

        if (willPayWhenCheckout) {
          var duration      = moment.duration(moment().diff(moment(startTime)));
          var hours         = Math.abs(duration.asHours());
          var  HOUR_BETWEEN_CHECKIN_TIME_START_TIME = 14;
          if (hours > HOUR_BETWEEN_CHECKIN_TIME_START_TIME) {
            throw('Checkin time doesn\'t match with booking time');
          }
        }
        else {
           ////
        }
        var data = { userId: userId, username: username, bookingId: bookingData.id};
        return RecordModel.recordCheckin(data)
      }
      else {
        throw('Please create booking first');
      }
  })
  .then( function (data) {
      return res.success(data);
  })
  .catch( function (error) {
      return res.error(error);
  });
});

Parse.Cloud.define("recordCheckout", function(req, res) {
  var params    = req.params;
  var userId    = params.userId;
  var username  = params.username;
  var bookingId = params.bookingId;

  BookingModel.getBookingByParams({ bookingId: bookingId, status: "OPEN" })
    .then(function(bookingInfo) {
      var bookingInfoToJSON = bookingInfo.toJSON();
      if (bookingInfoToJSON.package && bookingInfoToJSON.package.willPayWhenCheckout) {
        return RecordModel.recordCheckoutAndPreviewBooking({ username: username, userId: userId, bookingId: bookingId, status: "OPEN" });
      }
      else {
        return RecordModel.recordCheckout({ username: username, userId: userId });
      }
    })
    .then(function(data) {
      return res.success(data);
    })
    .catch( function (error) {
      return res.error(error);
    });
});

Parse.Cloud.define("getStatisticUserCheckin", function(req, res) {
    var review = req.params;
    if (!review.type) return;
    var timeRange = getStart_EndDay(review);
    RecordModel.getRecords(review, timeRange).then(function(recordData) {
    }, function(err) {
      res.error(err);
    });
});

function getStart_EndDay(review) {
  var now = new Date();
  var startDateTime, endDateTime;
  switch (review.type) {
    case 'daily':
      startDateTime = moment(now).subtract(11, 'day').startOf('day').toDate();
      endDateTime = moment(now).endOf('day').toDate();
      break;
    case 'weekly':
      startDateTime = moment(now).subtract(11, 'weeks').startOf('week').toDate();
      endDateTime = moment(now).endOf("week").toDate();
      break;
    case 'monthly':
      startDateTime = moment(now).subtract(11, 'months').startOf('month').toDate();
      endDateTime = moment(now).endOf("month").toDate();
      break;
    case 'yearly':
      startDateTime = moment(now).subtract(11, 'years').startOf('year').toDate();
      endDateTime = moment(now).endOf("year").toDate();
      break;
    default:
      startDateTime = moment(now).startOf('day').toDate();
      endDateTime = moment(now).endOf('day').toDate();
  }
  return { startDateTime: startDateTime, endDateTime: endDateTime};
}

function getCustomTimeRange(timeRange, validateTime) {
  var now = new Date();
  var _startDateTime, _endDateTime;
  _startDateTime = moment(timeRange.startDateTime).toDate();
  _endDateTime = moment(timeRange.endDateTime).toDate();
  return { startDateTime: _startDateTime, endDateTime: _endDateTime, timezoneOffset: timeRange.timezoneOffset };
}
