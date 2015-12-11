Test checksum success:

  $  ringpop-admin checksums 127.0.0.1:3000
   127.0.0.1:3000   *  (glob)
   127.0.0.1:3001   *  (glob)
   127.0.0.1:3002   *  (glob)
   127.0.0.1:3003   *  (glob)
   127.0.0.1:3004   *  (glob)

With bootstrap file option:

  $  ringpop-admin checksums $TESTDIR/hosts.json
   127.0.0.1:3000   *  (glob)
   127.0.0.1:3001   *  (glob)
   127.0.0.1:3002   *  (glob)
   127.0.0.1:3003   *  (glob)
   127.0.0.1:3004   *  (glob)

Invalid bootstrap file

  $  ringpop-admin checksums QWERTY
  
  assert.js:* (glob)
    throw new assert.AssertionError({
          ^
  AssertionError: invalid destination
      at TChannelPeer.makeOutSocket * (glob)
      at TChannelPeer.connect * (glob)
      at TChannelPeer.waitForIdentified * (glob)
      at TChannel.waitForIdentified * (glob)
      at AdminClient.requestV2 * (glob)
      at AdminClient.request * (glob)
      at AdminClient.stats * (glob)
      at mapMember * (glob)
      at Object.q.process [as _onImmediate] * (glob)
      at processImmediate [as _immediateCallback] * (glob)
  [8]
