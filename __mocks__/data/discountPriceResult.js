
const BOOKINGS          = require('./bookingData.js');
const BUSINESSES        = require('./businessData.js');
const DISCOUNTS         = require('./discountData.js');
const PACKAGES          = require('./packageData.js');
const SERVICES          = require('./serviceData.js');
const SERVICE_PACKAGES  = require('./servicePackageData.js');
const USERS             = require('./userData.js');
const PACKAGE_PRICE_RESULT = require('./packagePriceResult.js');

module.exports = {
  ANONYMOUS: {
    total: 0,
    percent: 0,
    amount: 0
  },
  USER_HOURS: {
    total: 0,
    percent: 0,
    amount: 0
  },
  USER_HOURS_DISCOUNT: {
    total: PACKAGE_PRICE_RESULT['USER_HOURS'].total * DISCOUNTS['USER_HOURS_DISCOUNT'].percent * 0.01,
    percent: DISCOUNTS['USER_HOURS_DISCOUNT'].percent,
    amount: 0
  }
}
