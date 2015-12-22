module.exports.discover = function ringpopDiscover(urlObj, uri, callback) {
    // TODO actually get a seedlist by querying ringpop

    // Check if ringpop discovery is used via a url or as a fallback
    if (urlObj.protocol === 'ringpop:') {
        return setImmediate(callback, null, [urlObj.host]);
    } else {
        return setImmediate(callback, null, [uri]);
    }
};
