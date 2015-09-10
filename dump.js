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

var fs = require('fs');
var ClusterManager = require('./lib/cluster-manager.js');
var AdminClient = require('./lib/admin-client.js');
var program = require('commander');

function main() {
    program
        .description('Dumps membership information to file')
        .option('-f --file <file>', 'File to dump to')
        .option('--tchannel-v1')
        .usage('[options] <hostport>');
    program.parse(process.argv);

    var coord = program.args[0];

    if (!coord) {
        console.error('Error: hostport is required');
        process.exit(1);
    }

    if (!program.file) {
        console.error('Error: file is required');
        process.exit(1);
    }

    var clusterManager = new ClusterManager({
        program: program,
        coordAddr: coord
    });
    clusterManager.fetchStats(onStats);

    function onStats(err) {
        if (err) {
            console.error('Error: ' + err.message);
            process.exit(1);
        }

        fs.writeFile(program.file, JSON.stringify(groupStats()), onWrite);
    }

    function groupStats() {
        return clusterManager.allStats.reduce(function reduce(groups, stats) {
            groups[stats.address] = stats;
            return groups;
        }, {});
    }

    function onWrite(err) {
        if (err) {
            console.error('Error: ' + err.message);
            process.exit(1);
        }

        process.exit();
    }
}

if (require.main === module) {
    main();
}
