Partitions command success:

  $  ringpop-admin partitions 127.0.0.1:3000
   Checksum*# Nodes*# Alive*# Suspect*# Faulty*Sample Host* (glob)
   *5*5*0*0*127.0.0.1:3000* (glob)


With bootstrap file:

  $  ringpop-admin partitions $TESTDIR/hosts.json
   Checksum*# Nodes*# Alive*# Suspect*# Faulty*Sample Host* (glob)
   *5*5*0*0*127.0.0.1:* (glob)


Unable to connect to host:

  $ ringpop-admin partitions 0.0.0.1:2999
  Error while fetching node stats: { [TchannelSocketError: tchannel socket error (* from connect): connect *] (glob)
    type: 'tchannel.socket',
    message: 'tchannel socket error (* from connect): connect *', (glob)
    hostPort: null,
    direction: 'out',
    remoteAddr: null,
    name: 'TchannelSocketError',
    socketRemoteAddr: '0.0.0.1:2999',
    causeMessage: 'connect *', (glob)
    origMessage: 'connect *', (glob)
    code: '*', (glob)
    errno: '*', (glob)
    syscall: 'connect',
    fullType: 'tchannel.socket~!~error.wrapped-io.connect.*' } (glob)
  Error: Failed to connect to ringpop listening on 0.0.0.1:2999.
  [1]


Provide hint if the user tries and fails to connect to localhost or 127.0.0.1

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
  Error: Failed to connect to ringpop listening on 127.0.0.1:2999. Ringpop ordinarily does not listen on the loopback interface. Try a different IP address.
  [1]

  $  ringpop-admin partitions localhost:2999
  Error while fetching node stats: { [TchannelSocketError: tchannel socket error (ECONNREFUSED from connect): connect ECONNREFUSED]
    type: 'tchannel.socket',
    message: 'tchannel socket error (ECONNREFUSED from connect): connect ECONNREFUSED',
    hostPort: null,
    direction: 'out',
    remoteAddr: null,
    name: 'TchannelSocketError',
    socketRemoteAddr: 'localhost:2999',
    causeMessage: 'connect ECONNREFUSED',
    origMessage: 'connect ECONNREFUSED',
    code: 'ECONNREFUSED',
    errno: 'ECONNREFUSED',
    syscall: 'connect',
    fullType: 'tchannel.socket~!~error.wrapped-io.connect.ECONNREFUSED' }
  Error: Failed to connect to ringpop listening on localhost:2999. Ringpop ordinarily does not listen on the loopback interface. Try a different IP address.
  [1]
