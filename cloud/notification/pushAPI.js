var _ = require('underscore');
var Locales = require('./pushLocale.js');

function notifyBookingChange (data, user, message) {
    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.equalTo("user", { "__type":"Pointer","className":"_User","objectId": user.id });
    Parse.Push.send({
      where: pushQuery,
      data: {
        alert: message,
        sound: "default",
        booking: data
      }
    },{
      useMasterKey: true
    })
    .then(function (result) {
        console.log('Send Push Success');
    })
    .catch(function (error) {
        console.log(error);
    });
}

exports.notifyBookingChange = notifyBookingChange;
