const BOOKINGS          = require('./bookingData.js');
const BUSINESSES        = require('./businessData.js');
const DISCOUNTS         = require('./discountData.js');
const PACKAGES          = require('./packageData.js');
const SERVICES          = require('./serviceData.js');
const SERVICE_PACKAGES  = require('./servicePackageData.js');
const USERS             = require('./userData.js');

module.exports = {
  ANONYMOUS: {
    total: PACKAGES['HOUR'].chargeRate * BOOKINGS['ANONYMOUS'].packageCount * BOOKINGS['ANONYMOUS'].numOfUsers,
    package:{
      name: PACKAGES['HOUR'].name,
      chargeRate: PACKAGES['HOUR'].chargeRate
    },
    count: BOOKINGS['ANONYMOUS'].packageCount,
    numOfUsers: BOOKINGS['ANONYMOUS'].numOfUsers
  },
  USER_HOURS: {
    total: PACKAGES['HOUR'].chargeRate * BOOKINGS['USER_HOURS'].packageCount * BOOKINGS['USER_HOURS'].numOfUsers,
    package:{
      name: PACKAGES['HOUR'].name,
      chargeRate: PACKAGES['HOUR'].chargeRate
    },
    count: BOOKINGS['USER_HOURS'].packageCount,
    numOfUsers: BOOKINGS['USER_HOURS'].numOfUsers
  },
  USER_HOURS_DISCOUNT: {
    total: PACKAGES['HOUR'].chargeRate * BOOKINGS['USER_HOURS'].packageCount * BOOKINGS['USER_HOURS'].numOfUsers,
    package:{
      name: PACKAGES['HOUR'].name,
      chargeRate: PACKAGES['HOUR'].chargeRate
    },
    count: BOOKINGS['USER_HOURS'].packageCount,
    numOfUsers: BOOKINGS['USER_HOURS'].numOfUsers
  },
}
