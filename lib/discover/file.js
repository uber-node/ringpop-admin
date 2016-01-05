var fs = require('fs');

module.exports.discover = function fileDiscover(urlObj, uri, callback) {
    var filename = urlObj.host + urlObj.pathname;
    fs.readFile(filename, function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        // assume the file is a json list of hosts
        try {
            data = JSON.parse(data);
        } catch (e) {
            callback(e);
            return;
        }

        // TODO add type tests for the data read from the file
        callback(null, data);
        return;
    });
};
