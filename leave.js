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

var AdminClient = require('./lib/admin-client.js');
var assertNoError = require('./lib/util.js').assertNoError;
var program = require('commander');

function main() {
    program
        .description('Makes node leave cluster')
        .option('--tchannel-v1')
        .usage('[options] <hostport>');
    program.parse(process.argv);

    var address = program.args[0];

    if (!address) {
        console.error('Error: hostport is required');
        process.exit(1);
    }

    var client = new AdminClient({
        useTChannelV1: program.tchannelV1
    });
    client.leave(address, function onLeave(err) {
        assertNoError(err);
        process.exit();
    });
}

if (require.main === module) {
    main();
}
