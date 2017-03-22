
// require cloud function here
require('./report.js');
require('./pushNotificationAPIs.js');
require('./user.js');
require('./category.js');
require('./business.js');
require('./reason.js');
require('./checkIn.js');
require('./checkOut.js');
require('./priceCalculating.js');
require('./booking.js');
require('./package.js');
require('./service.js');

// require before save _ after save for validating here
require('./validation/bookingValidation.js');
require('./validation/packageValidation.js');
require('./validation/serviceValidation.js');
require('./validation/servicePackageValidation.js');
require('./validation/discountValidation.js');
require('./validation/globalVariableValidation.js');
require('./validation/businessValidation.js');
