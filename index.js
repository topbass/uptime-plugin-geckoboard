
var CheckEvent = require('../../models/checkEvent');

exports.initWebApp = function(options) {
    var config = options.config.slack;

    CheckEvent.on('afterInsert', function(checkEvent) {

    });
}
