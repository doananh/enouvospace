// require cloud function here
require('./user.js');
require('./booking.js');
require('./package.js');
require('./service.js');
require('./venue.js');

require('./checkin.js');
require('./checkout.js');
require('./record.js');
require('./startup.js');


// require before save _ after save for validating here
require('./validation/bookingValidation.js');
require('./validation/packageValidation.js');
require('./validation/serviceValidation.js');
require('./validation/servicePackageValidation.js');
require('./validation/discountValidation.js');
require('./validation/globalVariableValidation.js');
require('./validation/businessValidation.js');
require('./validation/recordValidation.js');

// other here
require('./notification/pushAPI.js');
