var _ = require('underscore');
var moment = require('moment');

var BookingModel  = require('./models/bookingModel.js');

Parse.Cloud.define("sendEmailForShift", function(req, res) {
    var params = req.params;
  	var subject = 'Statistic shift from start date time: '+moment(params.startDateTime).add(7, 'hours').format("DD/MM/YYYY HH:mm")+' to end date time: '+moment(params.endDateTime).add(7, 'hours').format("DD/MM/YYYY HH:mm");
    var content = '<p><b>Statistic Shift For Receptionist:</b>'+params.visitorName+'</p>'
				+ '<p><b>- Total Number Of Record:</b>'+params.count+' records</p>'
				+ '<p><b>- Total Price:</b>'+params.totalPrice+ ' VND'+'</p';				
    BookingModel.sendMail(params.email_to, process.env.EMAIL_FROM, subject, content)   
    .then(function (response) {	
      return res.success(response);
    })
    .catch(function (error) {
      return res.error(error)
    });
});