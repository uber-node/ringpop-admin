Version:

  $ ringpop-admin -V
  \d+\.\d+\.\d+ (re)


Help:

  $ ringpop-admin --help
  
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
      reap         Remove nodes marked as faulty from the cluster
      heal         Start a partition heal coordinated by the coordinator node
      collisions   Show hash collisions of a ring
      help [cmd]   display help for [cmd]
  
    Command-line tools for Ringpop
  
    Options:
  
      -h, --help     output usage information
      -V, --version  output the version number
  
    Discovery:
  
      Most of the commands can discover the ring via
      a discoverUri like this: 'ringpop://127.0.0.1:3000'.
      If no protocol is specified 'ringpop://' will be
      used.
  
      Supported protocols are:
  
       - ringpop://
         Discover the ring by connecting to a host of
         the ring.
  
         Example: ringpop://127.0.0.1:3000
  
       - file://
         Discover the ring by reading a json file
         containing an array of host:port combinations
  
         Example: file:///absolute/path/to/file
         Example: file://./relative/path
         File content: ["127.0.0.1:3000"]
  
       - hyperbahn://
         Discover the ring by querying hyperbahn for
         the members of a service. When no hyperbahn
         ip and port are given 127.0.0.1:21300 will be
         used.
  
         Example: hyperbahn:///ringpop
         Example: hyperbahn://hyperbahn-ip:port/ringpop
  
