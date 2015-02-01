
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

            // from: 60 mins ago
            var begin = moment().subtract(60, 'minutes').valueOf();
            // to: now
            var end = moment().valueOf();

            check.getStatsForPeriod('hour', begin, end, function(err, stats) {
                if (err) {
                    return console.error(err);
                }

                var confCheck = [];

                if (config.check[check.name]) {
                    confCheck = config.check[check.name];
                } else if (config.check[check._id]) {
                    confCheck = config.check[check._id];
                } else {
                    return;
                }

                confCheck.forEach(function(widget, index) {
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
                        stats: stats,
                        numTick: stats.length,
                        moment: moment
                    };
                    var postData = ejs.render(fs.readFileSync(filename, 'utf8'), renderOptions);
                    var httpOptions = {
                        host: matches[2],
                        path: matches[3] || '/',
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Content-Length': postData.length
                        }
                    };
                    var protocol = matches[1];

                    sendHttpRequest(check.name, protocol, httpOptions, postData);
                });
            });
        });
    });
}

function sendHttpRequest(name, protocol, options, data) {
    var req = (
        protocol == 'https' ? https.request : http.request
    )(options, function(res) {
        if (res.statusCode == 200) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Geckoboard plugin response data [' + name + ']: ' + chunk);
            });
        } else {
            console.error('Geckoboard plugin response code: ' + res.statusCode);
            console.error('Geckoboard plugin response headers: ' + JSON.stringify(res.headers));
        }
    });

    req.on('error', function(_err) {
        console.error('Geckoboard plugin response error: ' + _err.message);
    });

    req.write(data);
    req.end();
}
