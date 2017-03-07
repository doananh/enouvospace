var MockData = require('./data');

function getUserBooking () {
  return new Promise((resolve, reject) => {
    resolve(MockData.BOOKINGS[1]);
  });
}

function getAnonymousBooking () {
  return new Promise((resolve, reject) => {
    resolve(MockData.BOOKINGS[2]);
  });
}

function multiReturnValueBooking () {
  return new Promise((resolve, reject) => {
    var myMock = jest.fn();
    myMock.mockReturnValueOnce(MockData.BOOKINGS[1])
          .mockReturnValueOnce(MockData.BOOKINGS[2])
    resolve([myMock(), myMock()])
  });

}

const request               = jest.genMockFromModule('request');
request.getUserBooking      = getUserBooking;
request.getAnonymousBooking = getAnonymousBooking;
request.multiReturnValueBooking = multiReturnValueBooking;
module.exports = request;
