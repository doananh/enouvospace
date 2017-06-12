var _ = require('underscore');

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

function formatData(listBookings, listRecords) {
  var bookings = listBookings.map((data) => {
    var newBooking = ultis.flatJSON({booking: data.toJSON(), isBooking: true});
    newBooking.bookingId = _.clone(newBooking.booking_objectId);
    newBooking.startTime = _.clone(newBooking.booking_startTime);
    newBooking.endTime = _.clone(newBooking.booking_endTime);
    delete newBooking.booking_objectId;
    delete newBooking.booking_startTime;
    delete newBooking.booking_endTime;
    return newBooking;
  });
  var records = listRecords.map((data) => {
    var newRecord = ultis.flatJSON(data.toJSON());
    newRecord.recordId = _.clone(newRecord.objectId);
    newRecord.startTime = _.clone(newRecord.checkinTime);
    newRecord.endTime = _.clone(newRecord.checkoutTime);
    delete newRecord.objectId;
    delete newRecord.checkinTime;
    delete newRecord.checkoutTime;
    return newRecord;
  });
  var listData = records.concat(bookings).map((data) => {
    return _.pick(data, [
      'bookingId', 'booking_user_username', 'booking_package_packageType_displayName', 'startTime', 'endTime',
      'booking_isPaid', 'booking_payAmount', 'booking_discountAmount', 'booking_createdAt', 'isBooking', 'booking_status',
      'recordId'
    ]);
  });
  return _.sortBy(listData, (data) => { return data.createdAt; }).reverse();
}