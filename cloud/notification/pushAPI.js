var _ = require('underscore');
const FCM_API_URL = "https://fcm.googleapis.com/fcm/send";
var FCM_CLIENT_KEY = process.env.FCM_KEY;

var Locales = require('./pushLocale.js');
