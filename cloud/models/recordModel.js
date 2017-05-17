
var _        = require('underscore');
var moment   = require('moment');

var Constants = require('./../constant.js');
var Tool      = require('./../utils/tools.js');

var PriceCalculatingModel = require('./priceCalculatingModel.js');
var BookingModel          = require('./bookingModel.js');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

function recordCheckin (_params) {
  return new Promise( (resolve, reject) => {
    var checkinTime = _params.checkinTime ?  _params.checkinTime : moment().toDate();
    var username    = _params.username;
    var userId      = _params.userId;
    var bookingId   = _params.bookingId;
    var code        = _params.code;
    var Record = Parse.Object.extend("Record");
    var record = new Record();
    record.set("checkinTime", checkinTime);
    record.set("username", username);
    record.set("userId", userId);
    record.set("booking", { "__type":"Pointer","className":"Booking","objectId":bookingId });
    record.save().then( function (data) {
      var checkinTime = data.get('checkinTime');
      var booking     = data.get('booking');
      return resolve({
        checkinTime: checkinTime.toISOString(),
        objectId: data.id,
        user: {
          userId: data.get('userId'),
          username: data.get('username'),
          code: code
        },
        bookingId: booking.objectId
      });
    })
    .catch ( function (error) {
      return reject(error);
    });
  });
}

function recordCheckout (_params) {
    return new Promise( (resolve, reject) => {
        var checkoutTime  = moment().toDate();
        var username      = _params.username;
        var userId        = _params.userId;
        var bookingId     = _params.bookingId;

        var recordQuery   = new Parse.Query("Record");
        recordQuery.descending("createdAt");
        if (username) {
          recordQuery.equalTo("username", username);
        }
        if (userId) {
          recordQuery.equalTo("userId", userId);
        }
        if (bookingId) {
          recordQuery.equalTo("booking", { "__type":"Pointer","className":"Booking","objectId":bookingId });
        }

        recordQuery.first()
        .then( function (recordData) {
            if (recordData) {
              recordData.set("checkoutTime", checkoutTime);
              return recordData.save();
            }
            else {
              throw('No record found to checkout');
            }
        })
        .then( function (recordData) {
            var recordObject = {
              objectId: recordData.id,
              checkinTime: recordData.get('checkinTime'),
              checkoutTime: recordData.get('checkoutTime'),
              bookingId: recordData.get('booking').id
            };
            return resolve(recordObject);
        })
        .catch( function (error) {
            return reject(error);
        });
    });
}

function recordCheckoutAndPreviewBooking (_params) {
  return new Promise( (resolve, reject) => {
      BookingModel.getBookingByParams(_params)
      .then( function (bookingData) {
          if (bookingData) {
            var data = { userId: _params.userId, username: _params.username };
            return Parse.Promise.when([
              recordCheckout(data),
              PriceCalculatingModel.previewPricing(bookingData)
            ]);
          }
          else {
            throw('Please create booking first');
          }
      })
      .then( function (results) {
          var recordObject = results[0];
          var priceDetailData = results[1];
          priceDetailData.latestRecord = recordObject;
          priceDetailData.isPreviewBooking = true;
          return resolve(priceDetailData);
      })
      .catch( function (error) {
          return reject(error);
      });
  });
}

function getRecordByParams (_params) {
  return new Promise( (resolve, reject) => {
    var bookingId = _params.bookingId;
    var query = new Parse.Query("Record");
    if (bookingId) {
      query.equalTo("booking", { "__type":"Pointer","className":"Booking","objectId":bookingId });
    }
    else {
      return reject('getRecord: require booking id params');
    }

    query.first()
    .then(function (recordData) {
        return resolve(recordData);
    })
    .catch(function (error){
        return reject(error);
    });
  });
}

function getRecords (_request, _periodOfTime) {
  return new Promise( (resolve, reject) => {
    var startDateTime = _periodOfTime.startDateTime;
    var endDateTime = _periodOfTime.endDateTime;
    var recordQuery   = new Parse.Query("Record");
    recordQuery.greaterThanOrEqualTo("checkinTime", startDateTime);
    recordQuery.lessThanOrEqualTo("checkinTime", endDateTime);
    recordQuery.include("booking");
    recordQuery.find()
    .then(function (recordData) {
      if (recordData) {
        var recordDataToArrayJson = Tool.convertArrayParseObjToArrayJson(recordData);
        var groupUserFollowTime = groupUserCheckinFollowTime(_request, recordDataToArrayJson, _periodOfTime);
        return resolve(groupUserFollowTime);
      }
      else {
        return reject('No record found');
      }
    })
  });
}

function groupUserCheckinFollowTime(_request, _recordDataToArrayJson, _periodOfTime) {
  var groupUserFollowTime;
  switch (_request.type) {
    case 'daily':
      groupUserFollowTime =  groupUserCheckinFollowDays(_recordDataToArrayJson, _periodOfTime);
      break;
    case 'weekly':
      groupUserFollowTime =  groupUserCheckinFollowWeeks(_recordDataToArrayJson, _periodOfTime);
      break;
    case 'monthly':
      groupUserFollowTime =  groupUserCheckinFollowMonths(_recordDataToArrayJson, _periodOfTime);
      break;
    case 'yearly':
      groupUserFollowTime =  groupUserCheckinFollowYears(_recordDataToArrayJson, _periodOfTime);
      break;
    default:
      groupUserFollowTime =  groupUserCheckinFollowDays(_recordDataToArrayJson, _periodOfTime);
  }
  return groupUserFollowTime;
}

function groupUserCheckinFollowYears(_recordDataToArrayJson, _periodOfTime) {
  var YearArray = [];
  var currentYear = moment(_periodOfTime.startDateTime);
  var stopYear = moment(_periodOfTime.endDateTime);
  var groupUserFollowYears =  _.groupBy(_recordDataToArrayJson, function(value) {
    return moment(value.checkinTime.iso).year();
  });
  while (moment(currentYear).isSameOrBefore(moment(stopYear))) {
    var groupUserFollowCurrentYear = groupUserFollowYears[moment(currentYear).year()];
    YearArray.push({
      displayTime: moment(currentYear).format("YYYY"),
      count: (groupUserFollowCurrentYear && groupUserFollowCurrentYear.length > 0) ? groupUserFollowCurrentYear.length : 0,
      totalPrice: (groupUserFollowCurrentYear && groupUserFollowCurrentYear.length > 0) ? totalPriceCheckin(groupUserFollowCurrentYear) : 0
    });
    currentYear = moment(currentYear).add(1, 'year');
  }
  return YearArray;
}

function groupUserCheckinFollowMonths(_recordDataToArrayJson, _periodOfTime) {
  var monthArray = [];
  var currentMonth = moment(_periodOfTime.startDateTime);
  var stopMonth = moment(_periodOfTime.endDateTime);
  var groupUserFollowMonths =  _.groupBy(_recordDataToArrayJson, function(value) {
    return moment(value.checkinTime.iso).month();
  });
  while (moment(currentMonth).isSameOrBefore(moment(stopMonth))) {
    var groupUserFollowCurrentMonth = groupUserFollowMonths[moment(currentMonth).month()];
    monthArray.push({
      displayTime: moment(currentMonth).format("MM/YYYY"),
      count: (groupUserFollowCurrentMonth && groupUserFollowCurrentMonth.length > 0) ? groupUserFollowCurrentMonth.length : 0,
      totalPrice: (groupUserFollowCurrentMonth && groupUserFollowCurrentMonth.length > 0) ? totalPriceCheckin(groupUserFollowCurrentMonth) : 0
    });
    currentMonth = moment(currentMonth).add(1, 'month');
  }
  return monthArray;
}

function groupUserCheckinFollowWeeks(_recordDataToArrayJson, _periodOfTime) {
  var weekArray = [];
  var currentWeek = moment(_periodOfTime.startDateTime).week();
  var stopWeek = moment(_periodOfTime.endDateTime).week();
  var groupUserFollowWeeks =  _.groupBy(_recordDataToArrayJson, function(value) {
    return moment(value.checkinTime.iso).week();
  });
  while ((parseInt(currentWeek) < parseInt(stopWeek)) || (parseInt(currentWeek) === parseInt(stopWeek))) {
    var groupUserFollowCurrentWeek = groupUserFollowWeeks[currentWeek];
    weekArray.push({
      displayTime: currentWeek,
      count: (groupUserFollowCurrentWeek && groupUserFollowCurrentWeek.length > 0) ? groupUserFollowCurrentWeek.length : 0,
      totalPrice: (groupUserFollowCurrentWeek && groupUserFollowCurrentWeek.length > 0) ? totalPriceCheckin(groupUserFollowCurrentWeek) : 0
    });
    currentWeek++;
  }
  return weekArray;
}

function groupUserCheckinFollowDays(_recordDataToArrayJson, _periodOfTime) {
  var dateArray = [];
  var currentDate = moment(_periodOfTime.startDateTime).format('YYYY-MM-DD');
  var stopDate = moment(_periodOfTime.endDateTime).format('YYYY-MM-DD');
  var groupUserFollowDays =  _.groupBy(_recordDataToArrayJson, function(value) {
    return moment(value.checkinTime.iso).format("YYYY-MM-DD");
  });
  while (moment(currentDate).isSameOrBefore(moment(stopDate))) {
    var groupUserFollowCurrentDay = groupUserFollowDays[currentDate];
    dateArray.push({
      displayTime: moment(currentDate).format("DD/MM/YYYY"),
      count: (groupUserFollowCurrentDay && groupUserFollowCurrentDay.length > 0) ? groupUserFollowCurrentDay.length : 0,
      totalPrice: (groupUserFollowCurrentDay && groupUserFollowCurrentDay.length > 0) ? totalPriceCheckin(groupUserFollowCurrentDay) : 0
    });
    currentDate = moment(currentDate).add(1, 'day').format("YYYY-MM-DD");
  }
  return dateArray;
}

function totalPriceCheckin(_data) {
  var totalPrice = 0;
  _.each(_data, function(item) {
    totalPrice += item.booking.payAmount; 
  });
  return totalPrice;
}

function uniqUserCheckinFollowDays(_groupUserFollowDay) {
  var uniqUsers = _.uniq(_groupUserFollowDay, false, function(item) {
    return (item && item.userId) ? item.userId : item;
  });
  return uniqUsers;
}

exports.getRecords = getRecords;
exports.getRecordByParams = getRecordByParams;
exports.recordCheckin   = recordCheckin;
exports.recordCheckout  = recordCheckout;
exports.recordCheckoutAndPreviewBooking = recordCheckoutAndPreviewBooking;
