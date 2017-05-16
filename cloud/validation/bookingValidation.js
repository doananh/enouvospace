
var _       = require('underscore');
var moment = require('moment');

var Constants = require('./../constant.js');

Parse.Cloud.beforeSave("Booking", function(req, res) {
  var user          = req.object.get('user');
  var packageCount  = req.object.get('packageCount');
  var pPackage      = req.object.get('package');
  var numOfUsers    = req.object.get('numOfUsers');
  var startTime     = req.object.get('startTime');
  var endTime       = req.object.get('endTime');
  var status        = req.object.get('status');

  if (_.isUndefined(user) || _.isEmpty(user)) {
    return res.error('Require user params');
  }

  if (user && !user.code && !user.id) {
    return res.error('Require code or id in user params');
  }

  if (user && user.code && user.id) {
    return res.error('only code or only id in user params');
  }

  if (user && user.id && !user.username) {
    return res.error('Require username in user');
  }

  if (user && user.code && (!_.isString(user.code) || (user.code.length < 4))) {
    return res.error('Invalid code format');
  }

  if (user && user.code && !user.username) {
    return res.error('Require username in user')
  }

  if ( _.isUndefined(packageCount) || _.isNull(packageCount) || (packageCount < 0)) {
    return res.error('invalid number of package');
  }

  if (!pPackage) {
    res.error('Require package params');
  }

  if (_.isNull(startTime) || _.isUndefined(startTime)) {
    return res.error('Require start time params');
  }

  if (!_.isNumber(numOfUsers) || (numOfUsers <= 0)) {
    return res.error('Require number of users params');
  }

  if (Constants.BOOKING_STATUSES.indexOf(status) < 0) {
    return res.error('Invalid status - please change it to OPEN or PENDING or CLOSED');
  }

  if (endTime && !pPackage.willPayWhenCheckout) {
    // temp remove for another bug about checkinTime & startTime - when checkinTime is early than startTime
    // if (moment(endTime).isBefore(startTime)) {
    //   return res.error('EndTime should be after StartTime');
    // }
  }

  if (status === "OPEN" && req.object.id) {
    var preStatus     = req.original.get('status');
    if (preStatus === "CLOSED") {
      return res.error('Cannot open the closed booking')
    }
  }

  if (status === "CLOSED" && (req.original.get('status') === "OPEN")) {
    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.equalTo("user", { "__type":"Pointer","className":"_User","objectId": user.id });
    Parse.Push.send({
      where: pushQuery,
      data: {
        alert: "YOUR BOOKING HAS BEEN CLOSED",
        sound: "default"
      }
    }, {
        success: function(){
          console.log('Send Push Success');
        },
        error: function (error) {
          console.log(error);
        }
    }, {
      useMasterKey: true
    });
  }

  return res.success();
});
