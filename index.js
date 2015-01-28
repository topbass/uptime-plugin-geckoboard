
// https://app.cyfe.com/api/push/54bc84094c37d986857583941523
// {
//     "data":  [
//         {
//             "Date":  "20130320",
//             "Users":  "1"
//         }
//     ],
//     "onduplicate":  {
//         "Users":  "replace"
//     },
//     "color":  {
//         "Users":  "#52ff7f"
//     },
//     "type":  {
//         "Users":  "line"
//     }
// }

//
// cyfe:
//   Google.com
//     endpoint: [Cyfe Push API endpoint]
//

var http = require('http');
var https = require('https');
var moment = require('moment');
var Ping = require('../../models/ping');

exports.initWebApp = function(options) {
    var config = options.config.cyfe;

    Ping.on('afterInsert', function(ping) {
        ping.findCheck(function(err, check) {
            if (err) {
                return console.error(err);
            }

            if (!config[check.name]) {
                return;
            }

            var endpoint = config[check.name].endpoint;
            var matches = endpoint.match(/(http|https):\/\/([^\/]+)(\/.*)?/);

            if (matches === null) {
                return;
            }

            var httpOpts = {
                host: matches[2],
                path: matches[3] || '/',
                method: 'POST'
            };
            var postdata = {
                data: [
                    {
                        'Date': moment(check.qos.timestamp).format('YYYYMMDD'),
                        'Response Time': check.qos.responseTime
                    }
                ],
                onduplicate: {
                    'Response Time': 'replace'
                },
                type: {
                    'Response Time': 'line'
                }
            }

            var req = (
                matches[1] == 'https' ? https.request : http.request
            )(httpOpts, function(res) {
                if (res.statusCode == 200) {
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        console.log('Cyfe plugin response data [' + check.name + ']: ' + chunk);
                    });
                } else {
                    console.error('Cyfe plugin response code: ' + res.statusCode);
                    console.error('Cyfe plugin response headers: ' + JSON.stringify(res.headers));
                }
            });
            req.on('error', function(_err) {
                console.error('Cyfe plugin response error: ' + _err.message);
            });
            req.write(JSON.stringify(postdata));
            req.end();
        });
    });
}
