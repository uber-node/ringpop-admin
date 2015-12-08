var url = require('url')

module.exports.protocols = {
    "hyperbahn:": require('./hyperbahn').discover,
    "file:": require('./file').discover,
    "ip:": require('./ip').discover,
    // by default fallback on ip discovery
    default: require('./ip').discover
}

// find a list of initial nodes to connect to based on the discover string
module.exports.discover = function (discover, callback) {
    var urlObj = url.parse(discover)
    var handler = module.exports.protocols[urlObj.protocol];
    console.warn("handler:", handler, "protocol:", urlObj.protocol)
    if (typeof handler === 'undefined') {
        handler = module.exports.protocols.default;
    }

    handler(urlObj, discover, callback);
    return
}