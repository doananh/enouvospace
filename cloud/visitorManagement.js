var _ = require('underscore');
var moment = require('moment');

var BookingModel  = require('./models/bookingModel.js');
var RecordModel   = require('./models/recordModel.js');
var ultis         = require('./utils/tools');

Parse.Cloud.define("getDataForVisitorManagement", (req, res) => {
  Promise.all([BookingModel.getAllBookingsForVisitorManagement(), RecordModel.getAllRecordsForVisitorManagement()])
    .then((data) => {
      return res.success(formatData(data[0], data[1]));
    }).catch((err) => {
    return res.error(err);
  })
})

Parse.Cloud.define("searchDataForVisitorManagement", (req, res) => {
  Promise.all([BookingModel.searchBookingsForVisitorManagement(req.params), RecordModel.searchRecordsForVisitorManagement(req.params)])
    .then((data) => {
      return res.success(formatData(data[0], data[1]));
    }).catch((err) => {
    return res.error(err);
  })
})

function formatData(listBookings, listRecords) {
  var bookings = listBookings.map((data) => {
    var newBooking = ultis.flatJSON({booking: data.toJSON(), isBooking: true});
    newBooking.bookingId = _.clone(newBooking.booking_objectId);
    if(newBooking.booking_startTime){
      newBooking.startTime = _.clone(newBooking.booking_startTime);
      delete newBooking.booking_startTime;
    }
    if(newBooking.booking_endTime){
      newBooking.endTime = _.clone(newBooking.booking_endTime);
      delete newBooking.booking_endTime;
    }
    newBooking.objectId = 'B-'+newBooking.bookingId;
    delete newBooking.booking_objectId;
    return newBooking;
  });
  var records = listRecords.map((data) => {
    var newRecord = ultis.flatJSON(data.toJSON());
    newRecord.recordId = _.clone(newRecord.objectId);
    if(newRecord.checkinTime){
      newRecord.startTime = _.clone(newRecord.checkinTime);
      delete newRecord.checkinTime;
    }
    if(newRecord.checkoutTime){
      newRecord.endTime = _.clone(newRecord.checkoutTime);
      delete newRecord.checkoutTime;
    }
    if(newRecord.booking_objectId){
      newRecord.bookingId = _.clone(newRecord.booking_objectId);
      delete newRecord.booking_objectId;
    }
    if(newRecord.startTime && newRecord.endTime) {
      var duration = new moment(newRecord.endTime).diff(new moment(newRecord.startTime), 'minutes');
      newRecord.totalHours = Math.floor(duration/60) +' h '+ (duration%60) +' m';
    }
    newRecord.objectId = 'RC-'+newRecord.objectId;
    return newRecord;
  });
  var listData = records.concat(bookings).map((data) => {
    return _.pick(data, [
      'bookingId', 'booking_user_name', 'booking_package_shortName', 'startTime', 'endTime', 'objectId',
      'booking_isPaid', 'booking_payAmount', 'booking_discountAmount', 'booking_createdAt', 'isBooking', 'booking_status',
      'booking_paymentMethod', 'recordId', 'totalHours'
    ]);
  });
  return _.sortBy(listData, (data) => { return data.startTime; }).reverse();
}