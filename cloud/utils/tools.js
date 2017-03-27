
var _ = require('underscore');
var moment = require('moment');

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

exports.getCode           = getCode;
exports.formatStringTime  = formatStringTime;
exports.getRandomString   = getRandomString;
