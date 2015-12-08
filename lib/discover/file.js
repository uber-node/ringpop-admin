var fs = require('fs');

module.exports.discover = function fileDiscover(urlObj, original, callback) {
    var filename = urlObj.host + urlObj.pathname;
    fs.readFile(filename, function (err, data) {
        if (err) {
            return callback(err);
        }

        // assume the file is a json list of hosts
        try {
            data = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }

        // TODO add type tests for the data read from the file
        return callback(null, data);
    });
}