Test checksum success:

  $  ringpop-admin checksums 127.0.0.1:3000
   127.0.0.1:3000   *  (glob)
   127.0.0.1:3001   *  (glob)
   127.0.0.1:3002   *  (glob)
   127.0.0.1:3003   *  (glob)
   127.0.0.1:3004   *  (glob)

With bootstrap file option:

  $  ringpop-admin checksums file://$TESTDIR/hosts.json
   127.0.0.1:3000   *  (glob)
   127.0.0.1:3001   *  (glob)
   127.0.0.1:3002   *  (glob)
   127.0.0.1:3003   *  (glob)
   127.0.0.1:3004   *  (glob)

Invalid bootstrap file

  $  ringpop-admin checksums QWERTY
  Error: Expected an ip:port, hostnames are not allowed.
  [1]

