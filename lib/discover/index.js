var url = require('url');

module.exports.protocols = {
    "hyperbahn:": require('./hyperbahn').discover,
    "file:": require('./file').discover,
    "ringpop:": require('./ringpop').discover,
    // by default fallback on ringpop discovery
    default: require('./ringpop').discover
};

// find a list of initial nodes to connect to based on the discover string
module.exports.discover = function discover(uri, callback) {
    var urlObj = url.parse(uri);
    var handler = module.exports.protocols[urlObj.protocol];
    if (typeof handler === 'undefined') {
        handler = module.exports.protocols.default;
    }

    handler(urlObj, uri, callback);
};
