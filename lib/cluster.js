// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
'use strict';

var fs = require('fs');

var async = require('async');
var AdminClient = require('./admin-client.js');
var Partition = require('./partition.js');
var Stats = require('./stats.js');

function Cluster(opts) {
    opts = opts || {
        dumpTo: 'ringpop-admin-stats.dump'
    };

    this.useTChannelV1 = opts.useTChannelV1;
    this.coordAddr = opts.coordAddr;
    this.adminClient = new AdminClient({
        useTChannelV1: this.useTChannelV1
    });
    this.fetchLimit = opts.fetchLimit || 50;

    this.partitions = {};
    this.lastDownloadTime = null;
    this.lastFetchTime = null;
    this.dumpTo = opts.dumpTo;
}

Cluster.prototype.getPartitionAt = function getPartitionAt(index) {
    return this.getPartitions()[index];
};

Cluster.prototype.getPartitions = function getPartitions() {
    var self = this;

    return Object.keys(this.partitions).map(function mapCluster(membershipChecksum) {
        return self.partitions[membershipChecksum];
    });
};

Cluster.prototype.getClusterAt = function getClusterAt() {
    var partitions = this.getPartitions();

    partitions.sort(function sortBy(a, b) {
        if (a.membershipChecksum < b.membershipChecksum) {
            return -1;
        } else if (a.membershipChecksum > b.membershipChecksum) {
            return 1;
        } else {
            return 0;
        }
    });

    return partitions[0];
};

Cluster.prototype.getClusterChecksums = function getClusterChecksums() {
    return Object.keys(this.partitions);
};

Cluster.prototype.getPartitionCount = function getPartitionCount() {
    return Object.keys(this.partitions).length;
};

Cluster.prototype.fetchStats = function fetchStats(callback) {
    var self = this;

    // Reset with every fetch
    this.partitions = {};

    this.lastFetchTime = new Date().toISOString();
    var downloadTime = Date.now();

    this.adminClient.stats(this.coordAddr, function onSend(err, stats) {
        if (err) {
            callback(err);
            return;
        }

        if (!stats) {
            callback(new Error('stats could not be gathered'));
            return;
        }

        if (!stats.membership) {
            callback(new Error('stats did not contain membership'));
            return;
        }

        if (!stats.membership.members) {
            callback(new Error('membership did not contain members'));
            return;
        }

        async.mapLimit(stats.membership.members, self.fetchLimit, mapMember, onComplete);

        function mapMember(member, next) {
            self.adminClient.stats(member.address, function(err, stats) {
                var statsObj = new Stats();
                statsObj.address = member.address;

                if (err) {
                    next(null, statsObj);
                    return;
                }

                statsObj.membershipChecksum = stats.membership.checksum;
                statsObj.members = stats.membership.members;

                next(null, statsObj);
            });
        }

        function onComplete(err, allStats) {
            self.lastDownloadTime = Date.now() - downloadTime;
            self.allStats = allStats;
            self.allStats.forEach(function eachStats(stats) {
                self.parseStats(stats);
            });

            callback();
        }
    });
};

Cluster.prototype.lookup = function lookup(key, callback) {
    var self = this;
    this.fetchStats(function onStats(err) {
        if (err) {
            callback(err);
            return;
        }

        self.adminClient.lookup(self.coordAddr, key, callback);
    });
};

Cluster.prototype.parseStats = function parseStats(stats) {
    if (!stats.membershipChecksum) {
        return;
    }

    var cluster = this.partitions[stats.membershipChecksum];

    if (!cluster) {
        cluster = new Partition();
        cluster.membershipChecksum = stats.membershipChecksum;
        cluster.membership = stats.members;

        this.partitions[cluster.membershipChecksum] = cluster;
    }

    cluster.nodeCount++;
    cluster.addNode(stats.node);
};

Cluster.prototype.reuse = function reuse(opts, callback) {
    var self = this;
    var results = [];

    this.adminClient.stats(opts.coordinator, function onStats(err, stats) {
        if (err) {
            callback(err);
            return;
        }

        var members = stats.membership.members;
        async.eachLimit(members, opts.limit, iterator, onDone);
    });

    function iterator(member, callback) {
        self.adminClient.reuse(member.address, {
            memberAddr: opts.member
        }, function onReuse(err) {
            results.push({
                member: member.address,
                err: err
            });
            callback();
        });
    }

    function onDone() {
        callback(null, results);
    }
};

Cluster.prototype.dumpStats = function dumpStats() {
    fs.appendFile(
        this.dumpTo,
        JSON.stringify({
            timestamp: Date.now(),
            clusters: this.partitions
        }) + '\n',
        function() {} // NOOP, no way to display it right now.
    );
};

module.exports = Cluster;
