var TestData = require('../data');
var bookingMock = jest.fn();

function getBookingByPackage (_package) {
  return new Promise((resolve, reject) => {
    if (_package) {
      resolve(TestData.BOOKINGS[_package]);
    }
    else {
      reject('getBookingByPackage require package param');
    }
  });
}

function getMultiValueReturnBooking () {
  return new Promise((resolve, reject) => {
    bookingMock.mockImplementationOnce(() => TestData.BOOKINGS['ANONYMOUS'])
               .mockImplementationOnce(() => TestData.BOOKINGS['USER_HOURS'])
               .mockImplementationOnce(() => TestData.BOOKINGS['USER_HOURS_DISCOUNT'])
               .mockImplementationOnce(() => TestData.BOOKINGS['USER_DAYS'])
               .mockImplementationOnce(() => TestData.BOOKINGS['USER_DAYS_DISCOUNT'])
               .mockImplementationOnce(() => TestData.BOOKINGS['USER_WEEKS'])
               .mockImplementationOnce(() => TestData.BOOKINGS['USER_WEEKS_DISCOUNT'])
               .mockImplementationOnce(() => TestData.BOOKINGS['USER_MONTHS'])
               .mockImplementationOnce(() => TestData.BOOKINGS['USER_MONTHS_DISCOUNT']);
    resolve(bookingMock());
  });
}

const mockData = jest.genMockFromModule('./bookingModel');
mockData.getBookingByPackage         = getBookingByPackage;
mockData.getMultiValueReturnBooking  = getMultiValueReturnBooking;

module.exports = mockData;
