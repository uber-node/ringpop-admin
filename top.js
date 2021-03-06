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

var CliColor = require('cli-color');
var program = require('commander');

var createTable = require('./lib/table.js').create;
var ClusterManager = require('./lib/cluster.js');

var currentRows;
var isPaused = false;
var pageSize;
var refreshFn;
var refreshRate;
var refreshTimer;
var selectedRow = 0;
var viewportTop;
var viewportBottom;

var Defaults = {
    PageSize: 15,
    RefreshRate: 10000,
    TChannelVersion: 'v2'
};

function PartitionBar() {
    this.selectedPartition = 0;
}

function main() {
    program
        .description('A program that displays cluster membership information.')
        .option('-d, --dump-file <file>', 'dump file target for appending JSON stats', 'ringpop-admin-stats.dump')
        .option('-p, --page-size <page-size>', 'Page size. Default is 15.')
        .option('-r, --refresh-rate <refresh-rate>', 'Refresh rate (in milliseconds). Default is 10000.')
        .option('-R, --no-refresh', 'Turn refresh off. top will exit immediately after first download.')
        .option('--tchannel-v1', 'Use TChannel v1. Default is v2.')
        .usage('[options] <discoveryUri>');

    program.on('--help', function onHelp() {
        console.log('  Key bindings: ');
        console.log();
        console.log('    0-9      Toggle partition bar');
        console.log('    +/-      Increase/decrease refresh rate');
        console.log('    Up/down  Scroll up/down through member list');
        console.log('    Ctrl+f   Page down');
        console.log('    Ctrl+b   Page up');
        console.log('    [Space]  Pause/resume refresh');
        console.log('    d        Dump current stats');
        console.log('    q        Quit application');
    });

    program.parse(process.argv);

    var discoveryUri = program.args[0];

    if (!discoveryUri) {
        console.error('Error: discoveryUri is required');
        process.exit(1);
    }

    pageSize = +program.pageSize || Defaults.PageSize;
    refreshRate = +program.refreshRate || Defaults.RefreshRate;

    var clusterManager = new ClusterManager({
        discoveryUri: discoveryUri,
        dumpTo: program.dumpFile,
        useTChannelV1: program.tchannelV1
    });
    var partitionBar = new PartitionBar();

    if (program.refresh === false) {
        clusterManager.fetchStats(function onStats(err) {
            if (err) {
                console.log('Error: ' + err.message);
                process.exit(1);
            }

            printFullScreen(clusterManager, partitionBar);
            process.exit(0);
        });
    } else {
        refreshFn = function(refresh) {
            clusterManager.fetchStats(function onStats(err) {
                if (err) {
                    console.log('Error: ' + err.message);
                    process.exit(1);
                }

                printFullScreen(clusterManager, partitionBar);
                refresh();
            });
        };
        refreshAfter();

        waitForInput(clusterManager, partitionBar);
    }
}

function calcRefreshRate() {
    if (isPaused) {
        return 'Paused';
    }

    return (refreshRate / 1000) + 's';
}

function clearScreen() {
    /*jshint -W115 */
    process.stdout.write('\x1Bc');
}

function printPartitionBar(clusterManager, partitionBar) {
    var bar = '';

    var selectedPartition = partitionBar.selectedPartition;
    for (var i = 0; i < clusterManager.getPartitionCount(); i++) {
        if (selectedPartition === i + 1) {
            bar += CliColor.green.bgWhiteBright('   P' + (i + 1) + '   ');
        } else {
            bar += CliColor.black.bgWhite('   P' + (i + 1) + '   ');
        }
    }

    if (selectedPartition === 0) {
        bar = CliColor.green.bgWhiteBright('   All   ') + bar;
    } else {
        bar = CliColor.black.bgWhite('   All   ') + bar;
    }

    console.log(bar);
    console.log();
}

function printPartitionTable(clusterManager, partitionBar) {
    var columns = ['Address', 'Status', 'Inc. No.'];

    var partition = clusterManager.getPartitionAt(partitionBar.selectedPartition - 1);

    if (!partition) {
        console.log('Partition not available.');
        return;
    }

    var rows = partition.getSortedMembers().map(function each(member) {
        return [
            member.address,
            member.status,
            member.incarnationNumber
        ];
    });

    printViewport(columns, rows);
}

function printComparisonTable(clusterManager) {
    var partitions = clusterManager.getPartitions();

    var columns = ['Address'].concat(partitions.reduce(function reduce(columns, _, index) {
        var prtPrefix = 'P' + (index + 1);
        columns = columns.concat([prtPrefix]);
        return columns;
    }, []));

    var allMembersMap = partitions.reduce(function reduce(allMembers, partition) {
        partition.membership.forEach(function each(member) {
            allMembers[member.address] = true;
        });

        return allMembers;
    }, {});

    var allMembers = Object.keys(allMembersMap);
    allMembers.sort();

    var rows = [];

    for (var i = 0; i < allMembers.length; i++) {
        var member = allMembers[i];
        var cells = [member];

        partitions.forEach(eachPartition.bind(null, member, cells));

        rows.push(cells);
    }

    printViewport(columns, rows);

    function eachPartition(member, cells, partition) {
        var status;
        var incNo;

        for (var i = 0; i < partition.membership.length; i++) {
            var partitionMember = partition.membership[i];

            if (partitionMember.address === member) {
                status = partitionMember.status;
                incNo = partitionMember.incarnationNumber;
                break;
            }
        }

        cells.push(status || '--');
    }
}

function printPreamble(clusterManager) {
    var cluster = clusterManager.getClusterAt(0);

    clearScreen();

    if (clusterManager.getPartitionCount() === 1) {
        console.log('A cluster of ' + cluster.getNodeCount() + ' nodes have converged on a single membership view.');
    } else {
        console.log('The cluster has been partitioned in ' + clusterManager.getPartitionCount() + '.');
    }

    console.log('It took ' + clusterManager.lastDownloadTime + 'ms to report the stats below.');
    console.log();
    console.log('Last fetch: ' + clusterManager.lastFetchTime + ' (' + calcRefreshRate() + ')');
    console.log();
}

function printViewport(columns, rows) {
    var table = createTable(columns);

    if (typeof viewportTop === 'undefined') {
        viewportTop = selectedRow;
        viewportBottom = (viewportTop + pageSize) - 1;
    }

    for (var i = viewportTop; i < rows.length && i <= viewportBottom; i++) {
        var row = rows[i];

        if (selectedRow === i) {
            row = row.map(selectRow);
        }

        table.push(row);
    }

    currentRows = rows;

    console.log(table.toString());
    console.log(' ' + (selectedRow + 1) + ' of ' + rows.length);

    function selectRow(cell) {
        return CliColor.cyan(cell);
    }
}

function printFullScreen(clusterManager, partitionBar) {
    printPreamble(clusterManager);
    printPartitionBar(clusterManager, partitionBar);

    var selectedPartition = partitionBar.selectedPartition;
    if (selectedPartition === 0 || selectedPartition > clusterManager.getPartitionCount()) {
        printComparisonTable(clusterManager);
        partitionBar.selectedPartition = 0;
    } else {
        printPartitionTable(clusterManager, partitionBar);
    }
}

function lowerRefreshRate() {
    refreshRate -= 1000;

    if (refreshRate < 1000) {
        refreshRate = 1000;
    }
}

function pauseRefresh() {
    isPaused = true;
    clearTimeout(refreshTimer);
}

function raiseRefreshRate() {
    refreshRate += 1000;
}

function resumeRefresh() {
    isPaused = false;
    refreshAfter();
}

function refreshAfter() {
    var refreshIt = refreshFn.bind(null, function onDone() {
        scheduleRefresh();
    });

    refreshIt();

    function scheduleRefresh() {
        refreshTimer = setTimeout(function onTimeout() {
            refreshIt();
        }, refreshRate);
    }
}

function toggleRefresh() {
    if (isPaused) {
        resumeRefresh();
    } else {
        pauseRefresh();
    }
}

function pageUp() {
    selectedRow -= pageSize;

    if (selectedRow < 0) {
        selectedRow = 0;
    }

    if (selectedRow < viewportTop) {
        viewportTop = selectedRow;
        viewportBottom = (viewportTop + pageSize) - 1;
    }
}

function pageDown() {
    selectedRow += pageSize;

    if (currentRows && selectedRow >= currentRows.length) {
        selectedRow = currentRows.length - 1;
    }

    if (selectedRow > viewportBottom) {
        viewportTop = selectedRow;
        viewportBottom = (viewportTop + pageSize) - 1;
    }
}

function scrollUp() {
    selectedRow -= 1;

    if (selectedRow < 0) {
        selectedRow = 0;
    }

    if (selectedRow < viewportTop) {
        viewportTop = selectedRow;
        viewportBottom = (viewportTop + pageSize) - 1;
    }
}

function scrollDown() {
    selectedRow += 1;

    if (currentRows && selectedRow >= currentRows.length) {
        selectedRow = currentRows.length - 1;
    }

    if (selectedRow > viewportBottom) {
        viewportTop += 1;
        viewportBottom = selectedRow;
    }
}

function waitForInput(clusterManager, partitionBar) {
    var stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', function onData(data) {
        switch (data) {
            case '\u0003':
            case 'q':
                clearScreen();
                process.exit();
                break;
            case '\u001b[A':
                scrollUp();
                break;
            case '\u001b[B':
                scrollDown();
                break;
            case '\u0002':
                pageUp();
                break;
            case '\u0006':
                pageDown();
                break;
            case '+':
                raiseRefreshRate();
                break;
            case '-':
                lowerRefreshRate();
                break;
            case ' ':
                toggleRefresh();
                break;
            case 'd':
                clusterManager.dumpStats();
                break;
            default:
                var partitionNumber = +data;

                if (typeof (+partitionNumber) === 'number' &&
                        partitionNumber <= clusterManager.getPartitionCount()) {
                    partitionBar.selectedPartition = +data;
                }

                break;
        }

        printFullScreen(clusterManager, partitionBar);
    });
}

if (require.main === module) {
    main();
}
