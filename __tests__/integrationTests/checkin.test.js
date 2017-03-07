const Parse = require('parse/node');
Parse.initialize(process.env.APP_ID, process.env.JAVASCRIPT_KEY , process.env.MASTER_KEY);
Parse.serverURL = process.env.SERVER_URL;
var moments = require('moment');
var BookingUtil = require('./../models/checkinModel.test');
