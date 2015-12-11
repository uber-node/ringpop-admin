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

function Partition() {
    this.membershipChecksum = null;
    this.membership = null;
    this.nodes = [];
    this.nodeCount = 0;
    this.aliveCount = 0;
    this.suspectCount = 0;
    this.faultyCount = 0;
}

Partition.prototype.addNode = function addNode(node) {
    this.nodes.push(node);
};

Partition.prototype.getHostAddrs = function getHostAddrs() {
    var hosts = this.getMemberAddrs().reduce(function reduce(acc, addr) {
        var parts = addr.split(':');
        acc[parts[0]] = true;
        return acc;
    }, {});

    return Object.keys(hosts);
};

Partition.prototype.getHostCount = function getHostCount() {
    return this.getHostAddrs().length;
};

Partition.prototype.getMemberAddrs = function getMemberAddrs() {
    return this.membership.map(function map(member) {
        return member.address;
    });
};

Partition.prototype.getNodeCount = function getNodeCount() {
    return this.nodes.length;
};

Partition.prototype.getSortedMembers = function getSortedMembers() {
    var membersCopy = this.membership.slice(0);

    membersCopy.sort();

    return membersCopy;
};

module.exports = Partition;
