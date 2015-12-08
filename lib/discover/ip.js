module.exports.discover = function ipDiscover(urlObj, original, callback) {
    if (urlObj.protocol === 'ip:') {
        return setImmediate(callback, null, [urlObj.host])
    } else {
        return setImmediate(callback, null, [original])
    }
}