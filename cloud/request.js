

function getUserBooking () {
  return new Promise((resolve, reject) => {
    resolve('This is real getUserBooking function call');
  });
}

function getAnonymousBooking () {
  return new Promise((resolve, reject) => {
    resolve('This is real getAnonymousBooking function call');
  });
}

function multiReturnValueBooking () {
  return new Promise((resolve, reject) => {
    resolve([]);
  });
}

exports.getUserBooking = getAnonymousBooking;
exports.getAnonymousBooking = getAnonymousBooking;
exports.multiReturnValueBooking = multiReturnValueBooking;
