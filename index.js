
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

var http = require('http');
var https = require('https');
var Ping = require('../../models/ping');

exports.initWebApp = function(options) {
    var config = options.config.cyfe;

    Ping.on('afterInsert', function(ping) {
        ping.findCheck(function(err, check) {
            if (!config[check.name]) {
                return;
            }

            var endpoint = config[check.name];
            var matches = endpoint.match(/(http|https):\/\/([^\/]+)(\/.*)?/);

            if (matches === null) {
                return;
            }

            var httpOpts = {
                host: matches[2],
                path: matches[3] || '/',
                method: 'POST'
            };
        });
    });
}
