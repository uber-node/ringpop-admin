Partitions command success:

  $  ringpop-admin partitions 127.0.0.1:3000
   Checksum*# Nodes*# Alive*# Suspect*# Faulty*Sample Host* (glob)
   *5*5*0*0*127.0.0.1:3000* (glob)


With bootstrap file:

  $  ringpop-admin partitions $TESTDIR/hosts.json
   Checksum*# Nodes*# Alive*# Suspect*# Faulty*Sample Host* (glob)
   *5*5*0*0*127.0.0.1:* (glob)


Unable to connect to host:

  $  ringpop-admin partitions 127.0.0.1:2999
  Error while fetching node stats: { [TchannelSocketError: tchannel socket error (ECONNREFUSED from connect): connect ECONNREFUSED]
    type: 'tchannel.socket',
    message: 'tchannel socket error (ECONNREFUSED from connect): connect ECONNREFUSED',
    hostPort: null,
    direction: 'out',
    remoteAddr: null,
    name: 'TchannelSocketError',
    socketRemoteAddr: '127.0.0.1:2999',
    causeMessage: 'connect ECONNREFUSED',
    origMessage: 'connect ECONNREFUSED',
    code: 'ECONNREFUSED',
    errno: 'ECONNREFUSED',
    syscall: 'connect',
    fullType: 'tchannel.socket~!~error.wrapped-io.connect.ECONNREFUSED' }
  Error: Failed to connect to any ringpop members
  [1]
