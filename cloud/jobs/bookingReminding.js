const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;
var CronJob = require('cron').CronJob;

var checkoutEndOfDateJob = new CronJob({
  cronTime: '00 22 00 * * 1-6',
  onTick: function() {

  },
  start: true,
  timeZone: 'Asia/Ho_Chi_Minh'
});

var bookingRemindingJob = new CronJob({
  cronTime: '00 7 00 * * 1-6',
  onTick: function() {

  },
  start: true,
  timeZone: 'Asia/Ho_Chi_Minh'
});
