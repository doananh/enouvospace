const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;
var CronJob = require('cron').CronJob;

var recordCheckoutEndOfDateJob = new CronJob({
  cronTime: '00 00 23 * * 1-6',
  onTick: function() {
    Parse.Config.get()
    .then(function (config) {
        return config.get('AutoCheckoutWithInHours');
    })
    .then(function (AutoCheckoutWithInHours) {
        var recordQuery = new Parse.Query('Record');
        var d = new Date();
        var time = AutoCheckoutWithInHours * 3600 * 1000;
        var desTime = new Date(d.getTime() - (time));
        recordQuery.greaterThanOrEqualTo('checkinTime', desTime);
        recordQuery.doesNotExist('checkoutTime');
        recordQuery.each(function (record) {
            record.set('checkoutTime', d);
            return record.save();
        })
        .then(function (result) {
            // console.log('Auto record checkout success');
        })
        .catch(function (error) {
            // console.log('Auto record checkout failure');
            // console.log(error);
        });
    })
    .catch(function (error) {
        console.log(error);
    });
  },
  start: true,
  timeZone: 'Asia/Ho_Chi_Minh'
});

var bookingRemindingJob = new CronJob({
  cronTime: '00 30 7 * * 1-6',
  onTick: function() {

  },
  start: true,
  timeZone: 'Asia/Ho_Chi_Minh'
});
