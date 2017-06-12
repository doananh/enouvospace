var _ = require('underscore');

var BookingModel  = require('./models/bookingModel.js');
var RecordModel   = require('./models/recordModel.js');

Parse.Cloud.define("getDataForVisitorManagement", (req, res) => {
  Promise.all([BookingModel.getAllBookings(), RecordModel.getAllRecords()])
    .then((data) => {
      var listData = data[0].concat(data[1]);
      return res.success(_.sortBy(listData, (data) => { return data.get("createdAt"); }).reverse().map((data) => {
        return data.toJSON();
      }));
    }).catch((err) => {
      return res.error(err);
    })
})