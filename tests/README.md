ringpop-admin tests
===================

ringpop-admin tests are written using [cram](https://bitheap.org/cram/). Cram runs rinpop-admin commands and compares the output to known good output.

In order to run ringpop-admin commands, the test runner spins up a test cluster using `tick-cluster.js` (from ringpop-node).


Prerequisites
-------------

 * cram (tested with v0.6) (`sudo pip install cram`)

Tested on Mac OS X.

Note that `tick-cluster.js` uses TCP ports 2999-3005. Please ensure these ports are free before running the tests.


Running the tests
-----------------

You can run the tests by doing:

    ./run-tests

Modifying existing tests
------------------------

If you've modified the output of ringpop-admin and you want to update the "known good" data, call `run-tests` with the `--update` flag:

    ./run-tests --update

This will pass the `-i` flag to cram. When the test fails, a diff will be displayed and you will have the option to accept the new output, e.g.:

    $ ./run-tests --update
    ...
    ringpop-admin.t: failed
    --- ringpop-admin.t
    +++ ringpop-admin.t.err
    @@ -20,6 +20,7 @@
           leave        Makes node leave the cluster
           list         List member information
           lookup       Lookup a key in the ring
    +      join         Makes node (re)join the cluster
           status       Status of members in ring
           partitions   Show partition information of a ring
           top          General membership information
    Accept this change? [yN] 


When you press 'Y' the test file will automatically be updated. You should commit the updated file to the repository.

Creating new tests
------------------

There is a tool to help you get started creating new tests.

Call this script with an optional description and then the command you want to test:

    ./create-cram-test "Test help output" -- ringpop-admin --help

The script will output a valid cram test to stdout.
