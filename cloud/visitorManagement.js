var _ = require('underscore');

var BookingModel  = require('./models/bookingModel.js');
var RecordModel   = require('./models/recordModel.js');
var ultis         = require('./utils/tools');

Parse.Cloud.define("getDataForVisitorManagement", (req, res) => {
  Promise.all([BookingModel.getAllBookingsUnCheckin(), RecordModel.getAllRecords()])
    .then((data) => {
      return res.success(formatData(data[0], data[1]));
    }).catch((err) => {
      return res.error(err);
    })
})

function formatData(listBookings, listRecords) {
  var bookings = listBookings.map((data) => {
    return ultis.flatJSON({booking: data.toJSON(), isBooking: true});
  });
  var records = listRecords.map((data) => {
    return ultis.flatJSON(data.toJSON());
  });
  var listData = records.concat(bookings).map((data) => {
    return _.pick(data, [
      'booking_objectId', 'booking_user_username', 'booking_package_packageType_displayName', 'booking_startTime',
      'booking_isPaid', 'booking_payAmount', 'booking_discountAmount', 'booking_createdAt', 'isBooking', 'booking_status',
      'objectId', 'createdAt', 'checkinTime', 'checkoutTime'
    ]);
  });
  return _.sortBy(listData, (data) => { return data.createdAt; }).reverse();
}