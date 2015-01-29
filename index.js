
//
// geckoboard:
//   apiKey: [api key]
//   check:
//     Google.com
//       - url: [push url]
//         key: [widget key]
//         widget: [widget type, possible values are monitoring, linechart and highcharts]
//

var fs = require('fs');
var ejs = require('ejs');
var http = require('http');
var https = require('https');
var moment = require('moment');
var Ping = require('../../models/ping');

exports.initWebApp = function(options) {
    var config = options.config.geckoboard;
    var templateDir = __dirname + '/views/';

    Ping.on('afterInsert', function(ping) {
        ping.findCheck(function(err, check) {
            if (err) {
                return console.error(err);
            }
            if (!config.check[check.name]) {
                return;
            }

            config.check[check.name].forEach(function(widget, index) {
                var matches = widget.url.match(/(http|https):\/\/([^\/]+)(\/.*)?/);

                if (matches === null) {
                    return;
                }

                var filename = templateDir + widget.widget + '.ejs';
                var renderOptions = {
                    apiKey: config.apiKey,
                    widget: widget,
                    check: check,
                    ping: ping,
                    moment: moment
                };
                var json = ejs.render(fs.readFileSync(filename, 'utf8'), renderOptions);
                var httpOpts = {
                    host: matches[2],
                    path: matches[3] || '/',
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Content-Length': json.length
                    }
                };

                var req = (
                    matches[1] == 'https' ? https.request : http.request
                )(httpOpts, function(res) {
                    if (res.statusCode == 200) {
                        res.setEncoding('utf8');
                        res.on('data', function (chunk) {
                            console.log('Geckoboard plugin response data [' + check.name + ']: ' + chunk);
                        });
                    } else {
                        console.error('Geckoboard plugin response code: ' + res.statusCode);
                        console.error('Geckoboard plugin response headers: ' + JSON.stringify(res.headers));
                    }
                });
                req.on('error', function(_err) {
                    console.error('Geckoboard plugin response error: ' + _err.message);
                });
                req.write(json);
                req.end();
            });
        });
    });
}
