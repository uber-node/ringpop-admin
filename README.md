# ringpop-admin
Command-line tools for Ringpop

## Usage

```
  Usage: ringpop-admin [options] [command]


  Commands:

    checksums    Prints membership checksums
    dist         Distribution of keyspace
    dump         Dump membership information to disk
    count        Counts members
    leave        Makes node leave the cluster
    list         List member information
    lookup       Lookup a key in the ring
    join         Makes node (re)join the cluster
    status       Status of members in ring
    partitions   Show partition information of a ring
    top          General membership information
    help [cmd]   display help for [cmd]

  Command-line tools for Ringpop

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

## Tests

Tests are run by [cram](https://bitheap.org/cram/). To run the tests, first install cram:

    pip install cram

Then run the tests:

    npm test

For more information about how the tests work, see the file `tests/README.md`.
