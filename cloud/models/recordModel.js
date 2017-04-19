
var _        = require('underscore');
var moment   = require('moment');

var Constants = require('./../constant.js');
var Tool      = require('./../utils/tools.js');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

function recordCheckin (_params) {
  return new Promise( (resolve, reject) => {
    var checkinTime = moment().toDate();
    var username    = _params.username;
    var userId      = _params.userId;
    var bookingId   = _params.bookingId;

    var Record = Parse.Object.extend("Record");
    var record = new Record();

    record.set("checkinTime", checkinTime);
    record.set("username", username);
    record.set("userId", userId);
    record.set("booking", { "__type":"Pointer","className":"Booking","objectId":bookingId });
    record.save().then( function (data) {
      var checkinTime = data.get('checkinTime');
      return resolve(checkinTime.toISOString());
    })
    .catch ( function (error) {
      return reject(error);
    });
  });
}

function recordCheckout () {
  return new Promise( (resolve, reject) => {
    var checkoutTime  = moment().toDate();
    var username      = _params.username;
    var userId        = _params.userId;

    var recordQuery   = Parse.Query("Record");
    recordQuery.equalTo("username", username);
    recordQuery.equalTo("userId", userId);

    recordQuery.find()
    .then( function (recordData) {
        if (recordData) {
          return resolve(recordData);
        }
        else {
          throw('No record found to checkout');
        }
    })
    .catch( function (error) {
        return reject(error);
    });
  });
}

exports.recordCheckin   = recordCheckin;
exports.recordCheckout  = recordCheckout;