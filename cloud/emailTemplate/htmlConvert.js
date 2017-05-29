var _ = require('underscore');
var moment = require('moment');

function convert(jsonText) {
    var data = jsonText.object;
    var checinTime = data.get('startTime');
    var package = data.get('package');
    var user = data.get('user');
    var username = user.name || user.username;
    var numOfUsers = data.get('numOfUsers');
    var packageCount = data.get('packageCount');
    var payAmount = data.get('payAmount');
    var packageName = package.name;
    var packageChargeRate = package.chargeRate;
    var header = "<head><meta http-equiv='Content-Type' content='text/html; charset=utf-8'><title></title><meta http-equiv='X-UA-Compatible' content='IE=edge'><meta name='viewport' content='width=device-width'><style type='text/css'><link rel='stylesheet' type='text/css' href='booking.css'/></style><style type='text/css'>@import url(https://fonts.googleapis.com/css?family=Ubuntu:400,700,400italic,700italic);</style><link href='https://fonts.googleapis.com/css?family=Ubuntu:400,700,400italic,700italic' rel='stylesheet' type='text/css'><style type='text/css'>body{background-color:#f0f0f0}.logo a:hover,.logo a:focus{color:#859bb1 !important}.mso .layout-has-border{border-top:1px solid #bdbdbd;border-bottom:1px solid #bdbdbd}.mso .layout-has-bottom-border{border-bottom:1px solid #bdbdbd}.mso .border,.ie .border{background-color:#bdbdbd}.mso h1,.ie h1{}.mso h1,.ie h1{font-size:36px !important;line-height:43px !important}.mso h2,.ie h2{}.mso h2,.ie h2{font-size:22px !important;line-height:31px !important}.mso h3,.ie h3{}.mso h3,.ie h3{font-size:18px !important;line-height:26px !important}.mso .layout__inner,.ie .layout__inner{}.mso .footer__share-button p{}.mso .footer__share-button p{font-family:Ubuntu,sans-serif}</style><meta name='robots' content='noindex,nofollow'></meta><meta property='og:title' content='Booking request'></meta></head>";
    var body = "<body class='full-padding' style='margin: 0;padding: 0;-webkit-text-size-adjust: 100%;'><table class='wrapper' style='border-collapse: collapse;table-layout: fixed;min-width: 320px;width: 100%;background-color: #f0f0f0;' cellpadding='0' cellspacing='0' role='presentation'><tbody> <tr><td><div role='banner'><div class='preheader' style='Margin: 0 auto;max-width: 560px;min-width: 280px; width: 280px;width: calc(28000% - 167440px);'><div style='border-collapse: collapse;display: table;width: 100%;'><div class='snippet' style='display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 140px; width: 140px;width: calc(14000% - 78120px);padding: 10px 0 5px 0;color: #bdbdbd;font-family: Ubuntu,sans-serif;'></div><div class='webversion' style='display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 139px; width: 139px;width: calc(14100% - 78680px);padding: 10px 0 5px 0;text-align: right;color: #bdbdbd;font-family: Ubuntu,sans-serif;'></div></div></div><div class='header' style='Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);' id='emb-email-header-container'><div class='logo emb-logo-margin-box' style='font-size: 26px;line-height: 32px;Margin-top: 6px;Margin-bottom: 20px;color: #c3ced9;font-family: Roboto,sans-serif;Margin-left: 20px;Margin-right: 20px;' align='center'><div class='logo-center' align='center' id='emb-email-header'><img style='display: block;height: auto;width: 100%;border: 0;max-width: 221px;' src='https://i1.createsend1.com/ei/d/F6/C1D/16E/202202/csfinal/logo.png' alt=' width='221'></div></div></div></div><div role='section'><div class='layout one-col fixed-width' style='Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;'><div class='layout__inner' style='border-collapse: collapse;display: table;width: 100%;background-color: #ffffff;' emb-background-style><div class='column' style='text-align: left;color: #787778;font-size: 16px;line-height: 24px;font-family: Ubuntu,sans-serif;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);'><div style='Margin-left: 20px;Margin-right: 20px;Margin-top: 24px;'><div style='line-height:20px;font-size:1px'>&nbsp;</div></div><div style='Margin-left: 20px;Margin-right: 20px;'><h1 style='Margin-top: 0;Margin-bottom: 0;font-style: normal;font-weight: normal;color: #565656;font-size: 30px;line-height: 38px;text-align: center;'>Welcome to Enouvo Space</h1><p style='Margin-top: 20px;Margin-bottom: 0;'>Dear " + username+ ",</p><p style='Margin-top: 20px;Margin-bottom: 0;'>We are pleased to welcome you as a new customer of Enouvo Space. We feel honored that you have chosen our co-working space for your business. We are eager to be of service.</p><p style='Margin-top: 20px;Margin-bottom: 0;'>We very much hope that you will feel inspirational and comfortable while at a our space.</p><p style='Margin-top: 20px;Margin-bottom: 0;'>Your Booking:</p><p style='Margin-top: 20px;Margin-bottom: 0;'>Checkin Time: "+ moment(checinTime).format('DD/MM/YYYY') +"</p><p style='Margin-top: 20px;Margin-bottom: 0;'>Number of users: "+ numOfUsers +"</p><p style='Margin-top: 20px;Margin-bottom: 0;'>Pay Amount: "+ payAmount.toLocaleString() +"</p><p style='Margin-top: 20px;Margin-bottom: 20px;'> Package Name: "+ packageName+"</p><p style='Margin-top: 20px;Margin-bottom: 20px;'> Package Charge Rate: "+ packageChargeRate.toLocaleString()+"</p></div><div style='Margin-left: 20px;Margin-right: 20px;'><div style='line-height:10px;font-size:1px'>&nbsp;</div></div><div style='Margin-left: 20px;Margin-right: 20px;'></div><div style='Margin-left: 20px;Margin-right: 20px;'><div style='line-height:10px;font-size:1px'>&nbsp;</div></div><div style='Margin-left: 20px;Margin-right: 20px;'><p style='Margin-top: 0;Margin-bottom: 20px;'><em>All answers are confidential and will not be shared outside of Secure bot.</em></p></div><div style='Margin-left: 20px;Margin-right: 20px;Margin-bottom: 24px;'><div style='line-height:5px;font-size:1px'>&nbsp;</div></div></div></div></div><div style='line-height:10px;font-size:10px;'>&nbsp;</div><div role='contentinfo'><div class='layout email-footer' style='Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;'><div class='layout__inner' style='border-collapse: collapse;display: table;width: 100%;'><div class='column wide' style='text-align: left;font-size: 12px;line-height: 19px;color: #bdbdbd;font-family: Ubuntu,sans-serif;Float: left;max-width: 400px;min-width: 320px; width: 320px;width: calc(8000% - 47600px);'><div style='Margin-left: 20px;Margin-right: 20px;Margin-top: 10px;Margin-bottom: 10px;'><table class='email-footer__links emb-web-links' style='border-collapse: collapse;table-layout: fixed;' role='presentation'><tbody><tr role='navigation'><td class='emb-web-links' style='padding: 0;width: 26px;'><a style='text-decoration: underline;transition: opacity 0.1s ease-in;color: #bdbdbd;' href='http://enouvo.createsend1.com/t/d-l-kjljldl-l-y/'><img style='border: 0;' src='https://i8.createsend1.com/static/eb/master/13-the-blueprint-3/images/facebook.png' width='26' height='26'></a></td><td class='emb-web-links' style='padding: 0 0 0 3px;width: 26px;'><a style='text-decoration: underline;transition: opacity 0.1s ease-in;color: #bdbdbd;' href='http://enouvo.createsend1.com/t/d-l-kjljldl-l-t/'><img style='border: 0;' src='https://i4.createsend1.com/static/eb/master/13-the-blueprint-3/images/instagram.png' width='26' height='26'></a></td></tr></tbody></table><div style='font-size: 12px;line-height: 19px;Margin-top: 20px;'><div>Enouvo Space Team</div></div><div style='font-size: 12px;line-height: 19px;Margin-top: 18px;'><div>15 Ta My Duat, An Hai Bac Ward, Son Tra District, Danang city, Vietnam</div></div></div></div><div class='column narrow' style='text-align: left;font-size: 12px;line-height: 19px;color: #bdbdbd;font-family: Ubuntu,sans-serif;Float: left;max-width: 320px;min-width: 200px; width: 320px;width: calc(72200px - 12000%);'><div style='Margin-left: 20px;Margin-right: 20px;Margin-top: 10px;Margin-bottom: 10px;'></div></div></div></div></div><div style='line-height:40px;font-size:40px;'>&nbsp;</div></div></td></tr></tbody></table></body>";
    var htmlEmail = "<!DOCTYPE html><html>"
    +   header
    +   body
    +  "</html>";
    return htmlEmail;
}

exports.convert = convert;