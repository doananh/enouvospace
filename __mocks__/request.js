const BookingTestData = {
  1: { // For USER
    numOfUsers: 2,
    packageCount: 1,
    isPaid: false,
    code: null,
    user: { "__type":"Pointer","className":"_User","objectId":"5xOQAXlxAv" },
    package: { "__type":"Pointer","className":"Package","objectId":"JzZjUF7lU1" },
    business: 'undefined',
    payAmount: 'undefined',
    discountAmount: 'undefined',
    startTime: '2017-02-24T08:00:00.000Z',
    endTime: '2017-02-24T21:00:00.000Z',
    status: 'Pending',
  },
  2: { // For ANONYMOUS
    numOfUsers: 1,
    packageCount: 1,
    isPaid: false,
    code: 'A001',
    user: 'undefined',
    package: { "__type":"Pointer","className":"Package","objectId":"5VEub2n51G" },
    business: 'undefined',
    payAmount: 'undefined',
    discountAmount: 'undefined',
    startTime: '2017-02-24T08:00:00.000Z',
    endTime: '2017-02-24T09:00:00.000Z',
    status: 'Pending',
  }
};

function getUserBooking () {
  return new Promise((resolve, reject) => {
    resolve(BookingTestData[1]);
  });
}

function getAnonymousBooking () {
  return new Promise((resolve, reject) => {
    resolve(BookingTestData[2]);
  });
}

function multiReturnValueBooking () {
  return new Promise((resolve, reject) => {
    var myMock = jest.fn();
    myMock.mockReturnValueOnce(BookingTestData[1])
          .mockReturnValueOnce(BookingTestData[2])
    resolve([myMock(), myMock()]) 
  });

}

const request               = jest.genMockFromModule('request');
request.getUserBooking      = getUserBooking;
request.getAnonymousBooking = getAnonymousBooking;
request.multiReturnValueBooking = multiReturnValueBooking;
module.exports = request;
