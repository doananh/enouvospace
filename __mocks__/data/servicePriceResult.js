const BOOKINGS          = require('./bookingData');
const BUSINESSES        = require('./businessData');
const DISCOUNTS         = require('./discountData');
const PACKAGES          = require('./packageData');
const SERVICES          = require('./serviceData');
const SERVICE_PACKAGES  = require('./servicePackageData');
const USERS             = require('./userData');

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
