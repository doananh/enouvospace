

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

module.exports = {
  getUserBooking,
  getAnonymousBooking,
  multiReturnValueBooking
}
