/**
 * Geckoboard plugin
 *
 * Send up/down status (monitoring widget) and response time (line chart and
 * highcharts widget) to Geckoboard
 *
 * Installation
 * ------------
 * This plugin is uninstalled by default. To install and enable it, git clone
 * the plugin repo and add its entry
 * to the `plugins` folder under uptime
 *
 *   $ git clone git@github.com:waltzofpearls/uptime-plugin-geckoboard.git geckoboard
 *
 * to the `plugins` key of the configuration:
 *
 *   // in config/production.yaml
 *   plugins:
 *     - ./plugins/geckoboard
 *
 * Configuration
 * -------------
 * Here is an example configuration:
 *
 *   // in config/production.yaml
 *   geckoboard:
 *     apiKey: [geckoboard api key]
 *     check:
 *       [Uptime check name]:
 *         - url: [geckoboard push url]
 *           key: [geckoboard widget key]
 *           widget: monitoring # monitoring, linechart or highcharts
 *         - url: [geckoboard push url]
 *           key: [geckoboard widget key]
 *           widget: linechart
 *           color: '#00ff00'
 */

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

    console.log(moment().format() + ' - Enabled Geckoboard data push');
}

function sendHttpRequest(name, protocol, options, data) {
    var req = (
        protocol == 'https' ? https.request : http.request
    )(options, function(res) {
        if (res.statusCode == 200) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log(moment().format() +
                    ' - Geckoboard plugin response data [' + name + ']: ' +
                    chunk);
            });
        } else {
            console.error(moment().format() +
                ' - Geckoboard plugin response code: ' + res.statusCode);
            console.error(moment().format() +
                ' - Geckoboard plugin response headers: ' +
                JSON.stringify(res.headers));
        }
    });

    req.on('error', function(_err) {
        console.error(moment().format() +
            ' - Geckoboard plugin response error: ' + _err.message);
    });

    req.write(data);
    req.end();
}
