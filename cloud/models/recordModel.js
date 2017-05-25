
var _        = require('underscore');
var moment   = require('moment');

var Constants = require('./../constant.js');
var Tool      = require('./../utils/tools.js');

var PriceCalculatingModel = require('./priceCalculatingModel.js');
var BookingModel          = require('./bookingModel.js');

const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;

function createNewRecord (_params) {
  return new Promise((resolve, reject) => {
      var checkinTime = _params.checkinTime ?  _params.checkinTime : moment().toDate();
      var Record = Parse.Object.extend("Record");
      var record = new Record();
      record.set("checkinTime", checkinTime);
      record.set("username", _params.user && _params.user.username);
      record.set("userId", _params.user && _params.user.id);
      record.set("booking", { "__type":"Pointer","className":"Booking","objectId": _params.bookingId });
      record.save()
      .then(function (recordData) {
          return resolve(recordData);
      })
      .catch(function (error) {
          return reject(error);
      });
  });
}

function getLastValidRecord (_params) {
  return new Promise((resolve, reject) => {
      var bookingId = _params.bookingId;
      var query = new Parse.Query("Record");
      query.equalTo("booking", { "__type": "Pointer", "className": "Booking", "objectId": bookingId });
      query.doesNotExist("checkoutTime");
      query.descending("createdAt");
      query.include("booking");
      query.find()
      .then(function (recordData) {
          if (recordData && recordData.length) {
            return resolve(recordData[0]);
          }
          else {
            return resolve(null);
          }
      })
      .catch(function (error) {
          return reject(error);
      });
  });
}

function recordCheckin (bookingData) {
  return new Promise((resolve, reject) => {
      var user  = bookingData.get('user');
      var code  = user.code;
      if (code) {
        var newRecordData = {
          user: {
            username: user.username
          },
          bookingId: bookingData.id
        }
        createNewRecord(newRecordData)
        .then(function (recordData) {
            var checkinTime = recordData.get('checkinTime');
            return resolve({
                checkinTime: checkinTime.toISOString(),
                objectId: recordData.id,
                user: {
                  userId: recordData.get('userId'),
                  username: recordData.get('username'),
                  code: code
                },
                booking: bookingData.toJSON()
            });
        })
        .catch(function (error) {
            return reject(error);
        });
      }
      else {
        getLastValidRecord({bookingId: bookingData.id})
        .then(function (recordData) {
            if (recordData) {
              return recordData;
            }
            else {
              var newRecordData = {
                user: {
                  id: user.id,
                  username: user.username
                },
                bookingId: bookingData.id
              }
              return createNewRecord(newRecordData);
            }
        })
        .then(function (recordData) {
            var checkinTime = recordData.get('checkinTime');
            var booking     = recordData.get('booking');
            var isNewRecord = booking && booking.id && booking.get('startTime');
            return resolve({
                checkinTime: checkinTime.toISOString(),
                id: recordData.id,
                user: {
                  userId: recordData.get('userId'),
                  username: recordData.get('username')
                },
                booking: isNewRecord ? booking.toJSON() : bookingData.toJSON()
            });
        })
        .catch(function (error) {
            return reject(error);
        });
      }
  });
}

function recordCheckout (bookingData) {
    return new Promise((resolve, reject) => {
        var user          = bookingData.get('user');
        var bookingId     = bookingData.id;
        var checkoutTime  = moment().toDate();

        var recordQuery   = new Parse.Query("Record");
        if (user.username) {
          recordQuery.equalTo("username", user.username);
        }
        if (user.id) {
          recordQuery.equalTo("userId", user.id);
        }
        if (bookingId) {
          recordQuery.equalTo("booking", { "__type": "Pointer","className": "Booking", "objectId": bookingId });
        }
        recordQuery.descending("createdAt");

        recordQuery.find()
        .then(function (recordData) {
            if (recordData && recordData.length) {
              recordData[0].set("checkoutTime", checkoutTime);
              return recordData[0].save();
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
              booking: bookingData.toJSON()
            };
            return resolve(recordObject);
        })
        .catch( function (error) {
            return reject(error);
        });
    });
}

function recordCheckoutAndPreviewBooking (bookingData) {
  return new Promise( (resolve, reject) => {
      recordCheckout(bookingData)
      .then(function (recordData) {
          return PriceCalculatingModel.previewPricing(bookingData)
          .then(function (previewData) {
              var priceDetailData               = previewData;
              priceDetailData.latestRecord      = recordData;
              priceDetailData.isPreviewBooking  = true;
              return priceDetailData;
          })
          .catch(function (error) {
              throw(error);
          })
      })
      .then(function (response) {
          return resolve(response);
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
exports.getStart_EndDay = getStart_EndDay;
exports.getRecords          = getRecords;
exports.getRecordByParams   = getRecordByParams;
exports.getLastValidRecord  = getLastValidRecord;
exports.recordCheckin       = recordCheckin;
exports.recordCheckout      = recordCheckout;
exports.recordCheckoutAndPreviewBooking = recordCheckoutAndPreviewBooking;
