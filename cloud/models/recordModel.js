
var _        = require('underscore');
var moment   = require('moment');

var Constants = require('./../constant.js');
var Tool      = require('./../utils/tools.js');

var PriceCalculatingModel = require('./priceCalculatingModel.js');
var BookingModel          = require('./bookingModel.js');
var packageModel  = require('./packageModel.js');

function createNewRecord (_params, _data) {
  return new Promise((resolve, reject) => {
      var checkinTime = _params.checkinTime ?  _params.checkinTime : moment().toDate();
      var Record = Parse.Object.extend("Record");
      var record = new Record();
      record.set("checkinTime", checkinTime);
      record.set("username", _params.user && _params.user.username);
      record.set("name", _params.user && _params.user.name);
      record.set("userId", _params.user && _params.user.id);
      record.set("booking", { "__type":"Pointer","className":"Booking","objectId": _params.bookingId });
      record.set("packageId", _params.packageId);
      record.set("venueId", _params.venueId);
      record.set("packageTypeId", _params.packageTypeId);
      if (_data && _data.checkoutByAdmin) {
        record.set("checkoutByAdmin", _data.checkoutByAdmin);
      }
      if(!_.isNull(_params.hasCheckined) && !_.isUndefined(_params.hasCheckined))
        record.set("hasCheckined", _params.hasCheckined);
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
      query.equalTo("hasCheckined", true);
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

function getLastInvalidRecord(_params){
  return new Promise((resolve, reject) => {
    var bookingId = _params.bookingId;
    var query = new Parse.Query("Record");
    query.equalTo("booking", { "__type": "Pointer", "className": "Booking", "objectId": bookingId });
    query.doesNotExist("checkoutTime");
    query.descending("createdAt");
    query.equalTo("hasCheckined", false);
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

function updateLastInvalidRecord(_params){
  return new Promise((resolve, reject) => {
    getLastInvalidRecord(_params)
      .then((recordData) => {
        if(!recordData) return resolve(null);

        recordData.set('hasCheckined', true);
        recordData.set('checkinTime', _params.checkinTime ?  _params.checkinTime : moment().toDate())
        return resolve(recordData.save());
      })
      .catch(function (error) {
        return reject(error);
      });
  });
}

function updateBookingData (_params) {
  return new Promise((resolve, reject) => {
      var hasCheckined = _params.hasCheckined;
      var checkinTime = _params.checkinTime ?  _params.checkinTime : moment().toDate();
      var query = new Parse.Query("Booking");
      query.equalTo("objectId", _params.bookingId);
      query.first().then(function(booking) {
        if (booking) {
          booking.set('status', _params.status);
          booking.set("startTime", checkinTime);
          booking.set("hasCheckined", hasCheckined);
          booking.save()
        }
        else {
          console.log('Update booking error');
        }
      })
      .then(function (bookingData) {
          console.log('Update booking successfully');
      })
      .catch(function (error) {
          console.log(error);
      });
  });
}

function createRecordNoBooking (_params) {
  return new Promise((resolve, reject) => {
    packageModel.getPackageDefault()
    .then(function (data) {
      return data;
    })
    .then(function (packageData) {
      var bookingParams = _.extend({}, _params, {"packageId": packageData.id, "hasCheckined": true});
      return BookingModel.createBookingForLoginUserNoBooking(bookingParams);
    })
    .then(function (bookingData) {
      return recordCheckin(bookingData, _params);
    })
    .then(function (recordData) {
      return resolve(recordData);
    })
    .catch(function (error) {
      return reject(error);
    });
  });
}

function recordCheckin (bookingData, _params) {
  return new Promise((resolve, reject) => {
      var user          = bookingData.get('user');
      var hasCheckined  = bookingData.get('hasCheckined');
      var packageData   = bookingData.get('package');
      var venueData     = packageData.venue;
      var packageTypeData     = packageData.packageType;
      var packageId     = packageData && packageData.objectId;
      var code  = user.code;
      if (code) {
        var newRecordData = {
          user: {
            username: user.name
          },
          bookingId: bookingData.id,
          packageId: packageId,
          venueId: venueData.objectId,
          packageTypeId: packageTypeData.objectId
        }
        createNewRecord(newRecordData, _params)
        .then(function (recordData) {
            var checkinTime = recordData.get('checkinTime');
            if(!hasCheckined) {
              updateBookingData({
                bookingId: bookingData.id,
                checkinTime: checkinTime,
                hasCheckined: true,
                status: Constants.BOOKING_STATUSES[2]
              })
            }
            return resolve({
                checkinTime: checkinTime.toISOString(),
                objectId: recordData.id,
                user: {
                  userId: recordData.get('userId'),
                  username: recordData.get('username'),
                  code: code
                },
                booking: bookingData.toJSON(),
                hasCheckined: recordData.get('hasCheckined')
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
              return updateLastInvalidRecord({bookingId: bookingData.id});
            }
        }).then(function (recordData) {
          if (recordData) {
            return recordData;
          }
          else {
            var newRecordData = {
              user: {
                id: user.id,
                username: user.name
              },
              bookingId: bookingData.id,
              packageId: packageId,
              venueId: venueData.objectId,
              packageTypeId: packageTypeData.objectId
            }
            return createNewRecord(newRecordData, _params);
          }
        })
        .then(function (recordData) {
            var checkinTime = recordData.get('checkinTime');
            var booking     = recordData.get('booking');
            var isNewRecord = booking && booking.id && booking.get('startTime');
            if(!hasCheckined) {
              updateBookingData({
                bookingId: bookingData.id,
                checkinTime: checkinTime,
                hasCheckined: true,
                status: Constants.BOOKING_STATUSES[2]
              })
            }
            return resolve({
                checkinTime: checkinTime.toISOString(),
                id: recordData.id,
                user: {
                  userId: recordData.get('userId'),
                  username: recordData.get('username')
                },
                booking: isNewRecord ? booking.toJSON() : bookingData.toJSON(),
                hasCheckined: recordData.get('hasCheckined')
            });
        })
        .catch(function (error) {
            return reject(error);
        });
      }
  });
}

function recordCheckout (bookingData, _params) {
    return new Promise((resolve, reject) => {
        var user          = bookingData.get('user');
        var bookingId     = bookingData.id;
        var checkoutTime  = moment().toDate();

        var recordQuery   = new Parse.Query("Record");
        if (user.name) {
          recordQuery.equalTo("username", user.name);
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
              if(_params && _params.checkoutByAdmin)
                recordData[0].set("checkoutByAdmin", _params.checkoutByAdmin);
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

function recordCheckoutAndPreviewBooking (bookingData, _params) {
  return new Promise( (resolve, reject) => {
      recordCheckout(bookingData, _params)
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
      var bookingId       = _params.bookingId;
      var userId          = _params.userId;
      var exlucdeBooking  = _params.exlucdeBooking;
      var latest          = _params.latest;

      var query = new Parse.Query("Record");
      if (bookingId) {
        query.equalTo("booking", {"__type": "Pointer","className": "Booking","objectId": bookingId});
      }
      if (userId) {
        query.equalTo("userId", userId);
      }
      if (!exlucdeBooking) {
        query.include("booking");
      }
      query.descending("createdAt");
      if (!bookingId && !userId) {
        return reject('getRecordByParams: require bookingId or userId params');
      }

      query.find().then(function (recordData) {
          if (latest) {
            return resolve(recordData && recordData[0]);
          }
          return resolve(recordData);
      })
      .catch(function (error) {
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
    if (_request && _request.receptionist) {
      recordQuery.equalTo("checkoutByAdmin", _request.receptionist);
    }
    recordQuery.include("booking");
    recordQuery.find()
    .then(function (recordData) {
      if (recordData) {
        var groupUserFollowTime = groupUserCheckinFollowTime(_request, recordData, _periodOfTime);
        return resolve(groupUserFollowTime);
      } else {
        return reject('No record found');
      }
    })
  });
}

function groupUserCheckinFollowTime(_request, _recordData, _periodOfTime) {
  var groupUserFollowTime;
  var recordDataToArrayJson = Tool.convertArrayParseObjToArrayJson(_recordData);
  switch (_request.type) {
    case 'daily':
      groupUserFollowTime =  groupUserCheckinFollowDays(recordDataToArrayJson, _periodOfTime);
      break;
    case 'weekly':
      groupUserFollowTime =  groupUserCheckinFollowWeeks(recordDataToArrayJson, _periodOfTime);
      break;
    case 'monthly':
      groupUserFollowTime =  groupUserCheckinFollowMonths(recordDataToArrayJson, _periodOfTime);
      break;
    case 'yearly':
      groupUserFollowTime =  groupUserCheckinFollowYears(recordDataToArrayJson, _periodOfTime);
      break;
    case 'custom':
      groupUserFollowTime =  groupUserCheckinFollowCustom(_recordData, _periodOfTime);
      break;
    default:
      groupUserFollowTime =  groupUserCheckinFollowDays(recordDataToArrayJson, _periodOfTime);
  }
  return groupUserFollowTime;
}

function groupUserCheckinFollowCustom(_recordData, _periodOfTime) {
  var totalPrice = 0;
  var recordDataToArrayJson = Tool.convertArrayParseObjToArrayJson(_recordData);
  _.each(recordDataToArrayJson, function(item) {
    totalPrice += item.booking.calculatedPrice;
  });
  return {
    count: recordDataToArrayJson.length,
    totalPrice: totalPrice,
    listRecord: _recordData
  }
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

function getAllRecordsForVisitorManagement (){
  return new Promise((resolve, reject) => {
    new Parse.Query("Record")
      .descending('checkinTime')
      .include("booking")
      .find()
      .then((data) => {
        return resolve(data);
      }).catch((err) => {
        return reject(err);
    })
  });
}

function searchRecordsForVisitorManagement (params){
  return new Promise((resolve, reject) => {
    var query = new Parse.Query("Record");
    if(params.visitorName)
      query.startsWith('username', params.visitorName);
    if(params.packageId)
      query.equalTo('packageId', params.packageId);
    if (params.bookingStatus)
      query.equalTo('status', params.bookingStatus);
    if (params.paymentMethod)
      query.equalTo('paymentMethod', params.paymentMethod);
    if(params.startTime && params.endTime && new moment(params.startTime).isBefore(new moment(params.endTime))){
      if(new moment(params.startTime).isBefore(new moment(params.endTime))){
        query.greaterThanOrEqualTo('checkinTime', new Date(params.startTime))
          .lessThanOrEqualTo('checkinTime', new Date(params.endTime));
      }else{
        return reject('Please start time must be before end time!');
      }
    }else{
      if((!params.startTime && params.endTime) || (!params.endTime && params.startTime)){
        return reject('Please select start time and end time!');
      }
    }

    query.descending('checkinTime')
      .include("booking")
      .find()
      .then((data) => {
        return resolve(data);
      }).catch((err) => {
      return reject(err);
    })
  });
}

function createOrUpdateRecordForPreBooking(params){
  return new Promise((resolve, reject) => {
    var recordQuery   = new Parse.Query("Record");

    recordQuery.equalTo("booking", { "__type": "Pointer","className": "Booking", "objectId": params.objectId });
    recordQuery.equalTo("hasCheckined", false);

    recordQuery.first()
      .then(function (recordData) {
        if (recordData) {
          recordData.set("checkinTime", params.checkinTime);
          return recordData.save();
        } else {
          const data = _.extend(params, {
            bookingId: params.objectId,
            packageId: params.package.objectId,
            hasCheckined: false,
            checkinTime: params.startTime,
            user: {
              username: params.user.name,
              id: params.user.id
            },
            venueId: params.package.venue.objectId,
            packageTypeId: params.package.packageType.objectId
          })
          return createNewRecord(data);
        }
      }).catch((error) => {
        return reject(error);
      })
  })
}

function getVenueIdAndPackageTypeId (_packageId) {
  return new Promise((resolve, reject) => {
    packageModel.getPackageById(_packageId)
    .then(function (packageDetail) {
      var venue = packageDetail.get('venue');
      var packageType = packageDetail.get('packageType');
      return resolve({
        venueId: venue.objectId,
        packageTypeId: packageType.objectId
      });
    })
    .catch((err) => {
      return reject(err);
    })
  });
}

function formatDataforExcel() {
  return new Promise((resolve, reject) => {
    getAllRecordsForVisitorManagement()
      .then((data) => {
        return resolve(_.map(data, (record) => {
          var recordJSON = record.toJSON();
          return [
            new moment(recordJSON.checkinTime).format('DD-MM-YYYY'),
            new moment(recordJSON.checkinTime).format('HH:mm'),
            recordJSON.checkoutTime ? new moment(recordJSON.checkoutTime).format('HH:mm') : '',
            recordJSON.totalHours,
            recordJSON.booking.user.name || '',
            recordJSON.booking.package.shortName || '',
            recordJSON.booking.calculatedPrice || '',
            recordJSON.booking.discountAmount || '',
            recordJSON.booking.downPayment || '',
            recordJSON.booking.payAmount || '',
            recordJSON.booking.paymentMethod || '',
            recordJSON.booking.status || '',
            recordJSON.checkoutByAdmin || '',
          ];
        }));
      })
      .catch((err) => {
        return reject(err);
      })
  });
}

function getRecordsById(_params) {
  var recordQuery = new Parse.Query("Record");
  recordQuery.equalTo("booking", { "__type": "Pointer", "className": "Booking", "objectId": _params.objectId });
  return recordQuery.find();
}

function changeUserInfo(_params) {
  var userData = _params.user;
  var recordData = _params.recordSelected;
  return new Promise((resolve, reject) => {
    var recordQuery   = new Parse.Query("Record");
    recordQuery.equalTo("username", recordData.username);
    recordQuery.include("booking");
    recordQuery.first()
    .then(function (record) {
      var booking =  record.get("booking");
      booking.set("user", {id: userData.objectId, username: userData.username, name: userData.name, type: "customer"});
      booking.save();
      record.set("userId", userData.objectId);
      record.set("username", userData.username);
      return record.save();
    })
    .then(function (response) {
      resolve(response);
    })
    .catch((err) => {
      return reject(err);
    })

  })
}

exports.changeUserInfo = changeUserInfo;
exports.getRecordsById          = getRecordsById;
exports.createRecordNoBooking = createRecordNoBooking;
exports.getStart_EndDay = getStart_EndDay;
exports.getRecords          = getRecords;
exports.getRecordByParams   = getRecordByParams;
exports.getLastValidRecord  = getLastValidRecord;
exports.recordCheckin       = recordCheckin;
exports.recordCheckout      = recordCheckout;
exports.recordCheckoutAndPreviewBooking = recordCheckoutAndPreviewBooking;
exports.getAllRecordsForVisitorManagement = getAllRecordsForVisitorManagement;
exports.searchRecordsForVisitorManagement = searchRecordsForVisitorManagement;
exports.createOrUpdateRecordForPreBooking = createOrUpdateRecordForPreBooking;
exports.formatDataforExcel                = formatDataforExcel;
