var TChannelAsThrift = require('tchannel/as/thrift');
var TChannel = require('tchannel');
var fs = require('fs');
var path = require('path');

module.exports.discover = function hyperbahnDiscover(urlObj, original, callback) {
    var host;
    if (urlObj.host) {
        host = urlObj.host;
    } else {
        host = '127.0.0.1:21300';
    }

    var client = TChannel();
    var hChannel = client.makeSubChannel({
        serviceName: 'hyperbahn',
        peers: [host]
    });
    var tchannelAsThrift = TChannelAsThrift({
        channel: hChannel,
        entryPoint: path.join(__dirname, 'hyperbahn.thrift')
    });

    tchannelAsThrift.waitForIdentified({
        host: host
    }, function onIdentified(err) {
        if (err) {
            callback(err);
            return;
        }

        tchannelAsThrift.request({
            host: host,
            serviceName: 'hyperbahn',
            headers: {
                cn: 'hyperbahn'
            },
            hasNoParent: true
        }).send('Hyperbahn::discover', {}, {
            query: {
                serviceName: urlObj.pathname.substr(1) // remove first slash
            }
        }, function (err, resp) {
            if (err) {
                return callback(err);
            }

            // parse the hyperbahn response
            var seeds;
            try {
                seeds = resp.body.peers.map(function(peer) {
                    switch (peer.ip.type) {
                        case 'ipv4':
                            return [intToIP(peer.ip.ipv4), peer.port].join(':')
                        default:
                            throw new Error("Unknown ip type '" + peer.ip.type + "'")
                    }
                });
            } catch (e) {
                return callback(e);
            }

            return callback(null, seeds);
        });
    });
}

function intToIP(int) {
    var part1 = int & 255;
    var part2 = ((int >> 8) & 255);
    var part3 = ((int >> 16) & 255);
    var part4 = ((int >> 24) & 255);

    return part4 + "." + part3 + "." + part2 + "." + part1;
}