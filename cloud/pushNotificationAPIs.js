var _ = require('underscore');
var localeArr = ['vi', 'en'];
const FCM_API_URL = "https://fcm.googleapis.com/fcm/send";
var FCM_CLIENT_KEY = process.env.FCM_KEY;
var rateArr = {
    '-2': {
        vi: 'Quá tồi tệ',
        en: 'Very poor'
    },
    '-1': {
        vi: 'Tồi tệ',
        en: 'Poor'
    },
    '0': {
        vi: 'Bình thường',
        en: 'Average'
    },
    '1': {
        vi: 'Tốt',
        en: 'Good'
    },
    '2': {
        vi: 'Tuyệt vời',
        en: 'Excellent'
    }
};

Parse.Cloud.beforeSave(Parse.Installation, function(request, response) {

  console.log('beforeSave instalation');
  // Parse.Cloud.useMasterKey();
  var installation = request.object.toJSON();
  request.object.set("business", installation.business);
  if (installation.deviceType == "ios")  {
    response.success();
  }
  var installationQuery = new Parse.Query(Parse.Installation);
  installationQuery.equalTo('deviceToken', installation.deviceToken);
  installationQuery.first({useMasterKey: true}).then(function(installationData) {

    if (_.isUndefined(installationData)) {
      response.success();
    } else {
      installationData.get('user').fetch().then(function(user) {
        var _user = user.toJSON();
        if (!_.isUndefined(_user.business)) {
          if (Array.isArray(_user.business)) {
            _user.business.forEach(function(business) {
              console.log(business.objectId)
              unsubscribeTopic(business.objectId, installation.deviceToken, installationData.get('localeIdentifier'));

            });
            response.success();
          }
        } else {
          response.success();
        }
      });
    }

  }, function(error) {
    response.error(error);
  });

});



function unsubscribeTopic(topic, registration_token, locale) {

  Parse.Cloud.httpRequest({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: 'key=' + FCM_CLIENT_KEY
    },
    url: 'https://iid.googleapis.com/iid/v1:batchRemove',
    body: {
      "to": '/topics/' + topic + '-' + locale,
      "registration_tokens": [registration_token]
    }
  }).then(function(httpResponse) {
    console.log(httpResponse.text);
  }, function(httpResponse) {
    console.error(httpResponse);
  });

}

Parse.Cloud.afterSave(Parse.Installation, function(request, response) {

  console.log('afterSave instalation');
  Parse.Cloud.useMasterKey();
  var installation = request.object.toJSON();
  if (installation.deviceType == 'android') {
    console.log(installation)

    subscribeTopic(installation.business, installation.deviceToken, installation.localeIdentifier);
    // request.object.get('user').fetch().then(function(user) {
    //   var _user = user.toJSON();
    //   console.log(_user);
    //   if (!_.isUndefined(_user.business)) {
    //     if (Array.isArray(_user.business)) {
    //       _user.business.forEach(function(business) {
    //         console.log(business.objectId)
    //         subscribeTopic(business.objectId, installation.deviceToken, installation.localeIdentifier);
    //       });
    //     }
    //   }
    // });
  }

});


function subscribeTopic(topic, registration_token, locale) {

  Parse.Cloud.httpRequest({
    method: 'POST',
    url: 'https://iid.googleapis.com/iid/v1:batchAdd',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: 'key=' + FCM_CLIENT_KEY
    },
    body: {
      "Authorization": '"' + 'key=' + FCM_CLIENT_KEY + '"',
      "to": '/topics/' + topic + '-' + locale,
      "registration_tokens": [registration_token]
    }
  }).then(function(httpResponse) {
    console.log(httpResponse.text);
  }, function(httpResponse) {
    console.error(httpResponse);
  });

}

Parse.Cloud.afterSave("Review", function(request, response) {

  var review = request.object.toJSON();
  request.object.get('business').fetch().then(function(business) {
    var pushQuery = new Parse.Query(Parse.Installation);
    var userQuery = new Parse.Query(Parse.User);
    userQuery.containedIn("business", [review.business]);
    sendEmergencyPushMessage(userQuery, review, business).then(function() {
      console.log('Send push');
    });
  });

});

function sendEmergencyPushMessage(userQuery, review, business) {

  return Parse.Promise.when(localeArr.map(function(locale) {
    var pushQuery = new Parse.Query(Parse.Installation);
    var message = createPushMessage(locale, review.point, business);
    var oneHourTime = 60 * 1000;
    pushQuery.matchesQuery('user', userQuery);
    pushQuery.equalTo('localeIdentifier', locale);
    pushQuery.equalTo('business', business.id);
    Parse.Push.send({
      where: pushQuery,
      expiration_interval: oneHourTime,
      data: {
        alert: message,
        title: "ReviewSystem",
        badge: "Increment",
        review: review,
        message: message,
        group: 'staff'
      }
    });
    sendPushFirebase(message, review, locale);
  }));

}

function sendPushFirebase(message, review, locale) {

  Parse.Cloud.httpRequest({
    method: 'POST',
    url: FCM_API_URL,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: 'key=' + FCM_CLIENT_KEY,
    },
    body: {
      "to": "/topics/" + review.business.objectId + '-' + locale,
      "notification": {
        "title": "ReviewSystem",
        "body": message,
        "sound": "default",
        "click_action": "fcm.ACTION.HELLO"
      },
      "data": {
        "title": "ReviewSystem",
        "body": message,
        "click_action": "fcm.ACTION.HELLO",
        "remote": true,
        "data": JSON.stringify(review)
      },
      "priority": "high"
    }
  }).then(function(httpResponse) {
    console.log(httpResponse.text);
  }, function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  });

}

function createPushMessage(locale, ratePoints, business) {

  if (locale === 'vi') {
    return 'Có một đánh giá ' + rateArr[ratePoints].vi + ' cho ' + business.get('name');
  } else {
    return 'There is a ' + rateArr[ratePoints].en + ' review for ' + business.get('name');
  }

  return '';

}
