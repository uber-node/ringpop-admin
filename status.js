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

var createTable = require('./lib/table.js');
var ClusterManager = require('./lib/cluster-manager.js');
var ClusterNode = require('./lib/cluster-node.js');
var program = require('commander');

function main() {
    program
        .description('Status of members in ring')
        .option('--tchannel-v1')
        .usage('[options] <hostport>');
    program.parse(process.argv);

    var coord = program.args[0];

    if (!coord) {
        console.error('Error: hostport is required');
        process.exit(1);
    }

    var clusterManager = new ClusterManager({
        program: program,
        coordAddr: coord
    });
    clusterManager.fetchStats(function onStats(err) {
        if (err) {
            console.error('Error: ' + err.message);
            process.exit(1);
        }

        var partitionCount = clusterManager.getPartitionCount();
        if (clusterManager.getPartitionCount() > 1) {
            console.error('Error: cluster is partitioned. An accurate count cannot be provided.');
            process.exit(1);
        }

        var table = createTable([]);
        var cluster = clusterManager.getClusterAt(0);
        cluster.membership.forEach(function each(member) {
            table.push([member.address, member.status]);
        });
        console.log(table.toString());
        process.exit();
    });
}

if (require.main === module) {
    main();
}
