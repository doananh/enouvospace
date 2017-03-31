const BOOKINGS          = require('./bookingData.js');
const BUSINESSES        = require('./businessData.js');
const DISCOUNTS         = require('./discountData.js');
const PACKAGES          = require('./packageData.js');
const SERVICES          = require('./serviceData.js');
const SERVICE_PACKAGES  = require('./servicePackageData.js');
const USERS             = require('./userData.js');

module.exports = {
  ANONYMOUS: {
    total: 1 * SERVICE_PACKAGES['COFFEE'].chargeRate + 5 * SERVICE_PACKAGES['PRINT'].chargeRate,
    items: [
      {
        count: 1,
        unit: SERVICE_PACKAGES['COFFEE'].unit,
        type: SERVICE_PACKAGES['COFFEE'].type,
        name: SERVICE_PACKAGES['COFFEE'].name,
        chargeRate: SERVICE_PACKAGES['COFFEE'].chargeRate,
      },
      {
        count: 5,
        unit: SERVICE_PACKAGES['PRINT'].unit,
        type: SERVICE_PACKAGES['PRINT'].type,
        name: SERVICE_PACKAGES['PRINT'].name,
        chargeRate: SERVICE_PACKAGES['PRINT'].chargeRate,
      }
    ]
  },

  USER_HOURS: {
    total: 1 * SERVICE_PACKAGES['COFFEE'].chargeRate + 1 * SERVICE_PACKAGES['PRINT'].chargeRate,
    items: [
      {
        count: 1,
        unit: SERVICE_PACKAGES['COFFEE'].unit,
        type: SERVICE_PACKAGES['COFFEE'].type,
        name: SERVICE_PACKAGES['COFFEE'].name,
        chargeRate: SERVICE_PACKAGES['COFFEE'].chargeRate,
      },
      {
        count: 1,
        unit: SERVICE_PACKAGES['PRINT'].unit,
        type: SERVICE_PACKAGES['PRINT'].type,
        name: SERVICE_PACKAGES['PRINT'].name,
        chargeRate: SERVICE_PACKAGES['PRINT'].chargeRate,
      }
    ]
  },

  USER_HOURS_DISCOUNT: {
    total: 1 * SERVICE_PACKAGES['COFFEE'].chargeRate + 1 * SERVICE_PACKAGES['PRINT'].chargeRate,
    items: [
      {
        count: 1,
        unit: SERVICE_PACKAGES['COFFEE'].unit,
        type: SERVICE_PACKAGES['COFFEE'].type,
        name: SERVICE_PACKAGES['COFFEE'].name,
        chargeRate: SERVICE_PACKAGES['COFFEE'].chargeRate,
      },
      {
        count: 1,
        unit: SERVICE_PACKAGES['PRINT'].unit,
        type: SERVICE_PACKAGES['PRINT'].type,
        name: SERVICE_PACKAGES['PRINT'].name,
        chargeRate: SERVICE_PACKAGES['PRINT'].chargeRate,
      }
    ]
  }
}
