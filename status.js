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

var assertTruthy = require('./lib/util.js').assertTruthy;
var Cluster = require('./lib/cluster.js');
var parseStatusCommand = require('./parser.js').parseStatusCommand;
var printTable = require('./lib/table.js').print;

function getDampScoreRange(allStats, statusMember) {
    var lowest = Number.MAX_VALUE;
    var highest = 0;

    allStats.forEach(function each(stat) {
        stat.members.forEach(function each(member) {
            if (member.address !== statusMember.address) return;

            var dampScore = member.dampScore;
            if (typeof dampScore === 'undefined') {
                return;
            }

            if (dampScore < lowest) {
                lowest = dampScore;
            }

            if (dampScore > highest) {
                highest = dampScore;
            }
        });
    });

    return lowest + '..' + highest;
}

function main() {
    var command = parseStatusCommand();
    var cluster = new Cluster({
        useTChannelV1: command.useTChannelV1,
        coordAddr: command.coordinator
    });
    cluster.fetchStats(function onStats(err) {
        assertTruthy(!err, (err && err.message));
        assertTruthy(cluster.getClusterAt(0),
            'Error: no members in the cluster could be reached');
        assertTruthy(cluster.getPartitionCount() === 1,
            'Error: cluster is partitioned. ' +
            'An accurate status cannot be provided');

        var partition = cluster.getPartitionAt(0);
        printTable(command, [
            'ADDRESS',
            'STATUS',
            'DAMPSCORE'
        ], function addRows(table) {
            // Add status information to table
            partition.membership.forEach(function each(member) {
                table.push([member.address, member.status,
                    getDampScoreRange(cluster.allStats, member)]);
            });
        });
        process.exit();
    });
}

if (require.main === module) {
    main();
}
