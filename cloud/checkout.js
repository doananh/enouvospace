var _ = require('underscore');
var moments = require('moment');

Parse.Cloud.define("checkout", function(req, res) {
  var params = req.params;
  getAnonymousUserInBooking(params)
  .then(function (user) {
    var startTime = user.get("startTime");
    var discountAmount = user.get("discountAmount");
    var packageData = user.get("package").toJSON();
    var packageType = packageData.type;
    var packageRate = packageData.chargeRate;
    var subtractTime = moments().diff(moments(startTime));
    var durationTimeDetails = moments.duration(subtractTime);
    var durationTime = durationTimeDetails.hours() + ":" + durationTimeDetails.minutes();
    var totalPrice = 0;
    var data = {
      checkinTime: startTime,
      checkoutTime: moments().toDate(),
      packageType: packageType,
      packageRate: packageRate,
      durationTime: durationTime,
      discountAmount: discountAmount,
      totalPrice: totalPrice 
    };
    res.success(data);
  }, function (error) {
    res.error(error);
  });
});

function getAnonymousUserInBooking (_params) {
  var bookingQuery = new Parse.Query("Booking");
    bookingQuery.equalTo("code", _params.code);
    bookingQuery.include("package");
  return  bookingQuery.first();
}