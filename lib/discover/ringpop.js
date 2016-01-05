module.exports.discover = function ringpopDiscover(urlObj, uri, callback) {
    // TODO actually get a seedlist by querying ringpop

    // Check if ringpop discovery is used via a url or as a fallback
    var host;
    if (urlObj.protocol === 'ringpop:') {
        host = urlObj.host;
    } else {
        host = uri;
    }

    if (!host.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+/)) {
        return setImmediate(callback, new Error("Expected an ip:port, hostnames are not allowed."));
    }

    return setImmediate(callback, null, [host]);
};
