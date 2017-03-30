
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

exports.getCode           = getCode;
exports.formatStringTime  = formatStringTime;
exports.getRandomString   = getRandomString;
exports.isValidCode       = isValidCode;
exports.formatToVNDString = formatToVNDString;
