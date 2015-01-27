
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

// var CheckEvent = require('../../models/checkEvent');
var Ping = require('../../models/ping');

exports.initWebApp = function(options) {
    var config = options.config.slack;

    // CheckEvent.on('afterInsert', function(checkEvent) {

    // });

    Ping.on('afterInsert', function(ping) {

    });
}
