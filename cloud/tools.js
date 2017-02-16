var _ = require('underscore');

function getCode(_lastCode) {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
  var firstChar, number = parseInt(_lastCode.substring(1)), secondChar, findIndex, code, zero = "0", zeros = "00";
  _.each(chars, function(char, index) {
    if (char === _lastCode.substring(0, 1)) {
      findIndex = index;
    }
  });
  for (var i=findIndex; i < chars.length-1; i++) {
    firstChar = chars[findIndex];
    if (number < 9) {
      for (var j=number; j < 9; j++) {
        secondChar =  zeros + (j+1).toString();
        break;
      }
    } else if (number < 99) {
      for (var j=number; j < 99; j++) {
        secondChar =  zero + (j+1).toString();
        break;
      }
    } else {
      for (var j=number; j < 999; j++) {
        secondChar = (j+1).toString();
        break;
      }
    } 
  }
  return code = firstChar.concat(secondChar)
}

exports.getCode = getCode;