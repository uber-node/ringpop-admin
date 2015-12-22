#!/usr/bin/env node

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

var createTable = require('./lib/table.js').create;
var ClusterManager = require('./lib/cluster.js');
var program = require('commander');

function main() {
    program
        .description('Prints membership checksums')
        .option('--tchannel-v1')
        .usage('[options] <discoveryUri>');
    program.parse(process.argv);

    var discoveryUri = program.args[0];

    if (!discoveryUri) {
        console.error('Error: discoveryUri is required');
        process.exit(1);
    }

    var clusterManager = new ClusterManager({
        useTChannelV1: program.useTChannelV1,
        discoveryUri: discoveryUri
    });
    clusterManager.fetchStats(function onStats(err) {
        if (err) {
            console.error('Error: ' + err.message);
            process.exit(1);
        }

        var checksums = reduceStatsToChecksums(clusterManager.allStats);
        var checksumsTable = createChecksumsTable(checksums);
        console.log(checksumsTable.toString());
        process.exit();
    });
}

function createChecksumsTable(checksums) {
    var addresses = Object.keys(checksums);
    addresses.sort();
    return addresses.reduce(function reduce(table, addr) {
        table.push([addr, checksums[addr].membership]);
        return table;
    }, createTable([]));
}

function reduceStatsToChecksums(allStats) {
    return allStats.reduce(function reduce(checksums, stats) {
        checksums[stats.address] = {
            membership: stats.membershipChecksum
        };
        return checksums;
    }, {});
}

if (require.main === module) {
    main();
}
