var MockData = require('./data');

function getUserBooking () {
  return new Promise((resolve, reject) => {
    resolve(MockData.BOOKINGS['USER_HOURS']);
  });
}

function getAnonymousBooking () {
  return new Promise((resolve, reject) => {
    resolve(MockData.BOOKINGS['ANONYMOUS']);
  });
}

function multiReturnValueBooking () {
  return new Promise((resolve, reject) => {
    var myMock = jest.fn();
    myMock.mockReturnValueOnce(MockData.BOOKINGS['USER_HOURS'])
          .mockReturnValueOnce(MockData.BOOKINGS['ANONYMOUS'])
    resolve([myMock(), myMock()])
  });

}

var request               = jest.genMockFromModule('request');
request.getUserBooking      = getUserBooking;
request.getAnonymousBooking = getAnonymousBooking;
request.multiReturnValueBooking = multiReturnValueBooking;
module.exports = request;
