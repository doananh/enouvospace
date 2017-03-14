const BOOKINGS          = require('./bookingData');
const BUSINESSES        = require('./businessData');
const DISCOUNTS         = require('./discountData');
const PACKAGES          = require('./packageData');
const SERVICES          = require('./serviceData');
const SERVICE_PACKAGES  = require('./servicePackageData');
const USERS             = require('./userData');

module.exports = {
  ANONYMOUS: {
    total: PACKAGES['HOUR'].chargeRate * BOOKINGS['ANONYMOUS'].packageCount * BOOKINGS['ANONYMOUS'].numOfUsers,
    package:{
      currency: PACKAGES['HOUR'].currency,
      name: PACKAGES['HOUR'].name,
      chargeRate: PACKAGES['HOUR'].chargeRate
    },
    count: BOOKINGS['ANONYMOUS'].packageCount,
    numOfUsers: BOOKINGS['ANONYMOUS'].numOfUsers
  },
  USER_HOURS: {
    total: PACKAGES['HOUR'].chargeRate * BOOKINGS['USER_HOURS'].packageCount * BOOKINGS['USER_HOURS'].numOfUsers,
    package:{
      currency: PACKAGES['HOUR'].currency,
      name: PACKAGES['HOUR'].name,
      chargeRate: PACKAGES['HOUR'].chargeRate
    },
    count: BOOKINGS['USER_HOURS'].packageCount,
    numOfUsers: BOOKINGS['USER_HOURS'].numOfUsers
  }
}
