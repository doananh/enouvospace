
var _ = require('underscore');
var moment    = require('moment');

const DEFAULT_CODE = "A000";

function getCode(_code) {
  var charLoop     = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
  var validCode = _code || DEFAULT_CODE;
  if ((!_.isString(_code)) || (_code === null) || (_code.length !== 4)) {
    validCode = DEFAULT_CODE;
  }
  var number    = parseInt((validCode).substring(1, 4)) + 1;
  var firstChar = validCode.charAt(0);
  if (number > 999) {
    number = 0;
    var firstCharIndex = charLoop.indexOf(firstChar);
    if (firstCharIndex >= (charLoop.length - 1)) {
      firstChar = charLoop.charAt(0);
    }
    else {
      firstChar = charLoop.charAt(firstCharIndex + 1);
    }
  }
  var strSecond   = number.toString();
  var pad         = "000";
  var paddingNum  = pad.substring(0, pad.length - strSecond.length) + strSecond;
  return firstChar + paddingNum;
}

function getRandomString() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
  var randomstring = '';
  var randomNumber = Math.floor(Math.random() * chars.length);
  randomstring += chars.substring(randomNumber,randomNumber+1);
  return randomstring;
}

function formatStringTime (dateTime) {
  var timeFormat = "DD-MM-YYYY hh:mm A";
  var strFormatDate   = moment(dateTime).format(timeFormat);
  return strFormatDate;
}

function formatCurrencyWithDot(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
}

function formatToVNDString (_value) {
  if (_value && _.isNumber(_value)) {
    var roundToThoundsand = Math.round(_value / 1000) * 1000;
    var res = roundToThoundsand.toFixed(0);
    res = formatCurrencyWithDot(res) + " VND";
    return res;
  }

  return "0 VND";
}

function isValidCode (_code) {
  if (_code && _.isString(_code) && (code.length === 4)) {
    return true;
  }
  return false;
}

function getEndTimeFromPackage (_startTime, _type, _count) {
  switch (_type) {
    case 'HOUR': {
      var endTime = moment(_startTime);
      if (_count) {
        endTime = endTime.add(_count, 'hours');
      }
      else {
        endTime = moment();
      }
      return endTime.toDate();
    }
    case 'DAY': {
      var endTime = moment(_startTime).add(_count - 1, 'days');
      return endTime.toDate();
    }
    case 'WEEK': {
      var endTime = moment(_startTime).add(_count, 'weeks');
      return endTime.toDate();
    }
    case 'MONTH': {
      var endTime = moment(_startTime).add(_count, 'months');
      return endTime.toDate();
    }
    default: {
      return null;
    }
  }
}

function getDurationDetail (_startTime, _endTime, _package) {
  switch (_package) {
    case 'HOUR': {
      var diffTime              = moment(_endTime).diff(moment(_startTime));
      var duration              = moment.duration(diffTime);
      var hourString            = (duration.hours() > 1) ? " hours " : " hour ";
      var minuteString          = (duration.minutes() > 1) ? " minutes " : " minute";
      var durationString        = duration.hours() + hourString + duration.minutes() + minuteString;
      return {
        "text": durationString,
        "count": duration.hours(),
        "value": duration.hours() * 60 + duration.minutes()
      }
    }
    case 'DAY': {
      var mStartTime      = moment(_startTime)
      var mEndTime        = moment(_endTime);
      var diffTime        = mStartTime.diff(mEndTime);
      var duration        = moment.duration(diffTime);
      var durationString  = "";
      if (duration.days() <= 1) {
        durationString = "1 day";
      }
      else {
        durationString = Math.round(duration.days) + "days";
      }

      return {
        "text": durationString,
        "count": (duration.days() < 1) ? 1 : duration.days(),
        "value": 0
      }
    }
    case 'WEEK': {
      var mStartTime      = moment(_startTime)
      var mEndTime        = moment(_endTime);
      var diffTime        = mStartTime.diff(mEndTime);
      var duration        = moment.duration(diffTime);
      var durationString  = "";
      if (duration.weeks() <= 1) {
        durationString = "1 week";
      }
      else {
        durationString = Math.round(duration.days) + "weeks";
      }

      return {
        "text": durationString,
        "count": (duration.weeks() < 1) ? 1 : duration.weeks(),
        "value": 0
      }
    }
    case 'MONTH': {
      var mStartTime      = moment(_startTime)
      var mEndTime        = moment(_endTime);
      var diffTime        = mStartTime.diff(mEndTime);
      var duration        = moment.duration(diffTime);
      var durationString  = "";
      if (duration.months() <= 1) {
        durationString = "1 month";
      }
      else {
        durationString = Math.round(duration.days) + "months";
      }

      return {
        "text": durationString,
        "count": (duration.months() < 1) ? 1 : duration.months(),
        "value": 0
      }
    }
    default: {
      return null;
    }
  }
}

exports.getCode           = getCode;
exports.formatStringTime  = formatStringTime;
exports.getRandomString   = getRandomString;
exports.isValidCode       = isValidCode;
exports.formatToVNDString = formatToVNDString;
exports.getEndTimeFromPackage = getEndTimeFromPackage;
exports.getDurationDetail     = getDurationDetail;
