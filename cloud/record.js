var _ = require('underscore');
var moment = require('moment');

var BookingModel  = require('./models/bookingModel.js');
var RecordModel   = require('./models/recordModel.js');
var Constant = require('./constant');

Parse.Cloud.define("recordCheckin", function(req, res) {
  var params  = req.params;
  var user    = params.user;
  BookingModel.getLastValidUserBooking({user: params.user})
  .then(function (bookingData) {
      if (bookingData) {
        var startTime       = bookingData.get('startTime');
        var packageObject   = bookingData.get('package');
        var status          = bookingData.get('status');
        var willPayWhenCheckout = packageObject.willPayWhenCheckout;

        if (status === "PENDING") {
          throw('Your booking is on waiting for approval');
        }
        if (status === "CLOSED") {
          throw('Your booking has been closed before');
        }
        if (status === "CANCELED") {
          throw('Your booking has been canceled before');
        }

        return RecordModel.recordCheckin(bookingData, params);
      } else {
        return RecordModel.createRecordNoBooking(params);
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
  var bookingId = params.bookingId;

  BookingModel.getBookingByParams({ id: bookingId, status: Constant.BOOKING_STATUSES[2] })
  .then(function (bookingData) {
      var bookingDataJSON = bookingData.toJSON();
      if (bookingDataJSON.package && bookingDataJSON.package.willPayWhenCheckout) {
        return RecordModel.recordCheckoutAndPreviewBooking(bookingData, params);
      }
      else {
        return RecordModel.recordCheckout(bookingData, params);
      }
  })
  .then(function (data) {
      return res.success(data);
  })
  .catch(function (error) {
      return res.error(error);
  });
});

Parse.Cloud.define("getLastValidUserRecord", function(req, res) {
    var params  = req.params;
    RecordModel.getLastValidRecord({bookingId: params.bookingId})
    .then(function (recordData) {
        if (recordData) {
          var recordObject = {
            objectId: recordData.id,
            checkinTime: recordData.get('checkinTime'),
            checkoutTime: recordData.get('checkoutTime'),
            booking: recordData.get('booking').toJSON(),
            hasCheckined: recordData.get('hasCheckined')
          };
          return res.success(recordObject);
        }
        else {
          return res.success({});
        }
    })
    .catch(function (error) {
        return res.error(error);
    });
});

Parse.Cloud.define("changeUserInfo", function(req, res) {
    var params = req.params;
    RecordModel.changeUserInfo(params)
    .then(function(data) {
      return res.success(data);
      // console.log('debug recordData'+JSON.stringify(data))
    })
    .catch( function (error) {
      console.log(error)
    });
});

Parse.Cloud.define("getStatisticUserCheckin", function(req, res) {
    var review = req.params;
    if (!review.type) return;
    var timeRange = RecordModel.getStart_EndDay(review);
    RecordModel.getRecords(review, timeRange)
    .then(function(recordData) {
      return res.success({totalUsersCheckedIn: recordData});
    })
    .catch( function (error) {
      return res.error(error);
    });
});

Parse.Cloud.define("getStatisticShifts", function(req, res) {
    var review = req.params;
    var timeRange = review.timeRange;
    if (!review.type) return;
    RecordModel.getRecords(review, timeRange)
    .then(function(recordData) {
      return res.success(recordData);
    })
    .catch( function (error) {
      return res.error(error);
    });
});
