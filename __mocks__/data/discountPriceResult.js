
const BOOKINGS          = require('./bookingData');
const BUSINESSES        = require('./businessData');
const DISCOUNTS         = require('./discountData');
const PACKAGES          = require('./packageData');
const SERVICES          = require('./serviceData');
const SERVICE_PACKAGES  = require('./servicePackageData');
const USERS             = require('./userData');
const PACKAGE_PRICE_RESULT = require('./packagePriceResult');

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
