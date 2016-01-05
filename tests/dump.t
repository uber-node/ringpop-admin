Dump command dumps file successfully:

  $  ringpop-admin dump file://$TESTDIR/hosts.json -f /tmp/ringpop-admin-dump-test.json

Check for non-zero file:

  $  du /tmp/ringpop-admin-dump-test.json |awk '{print $1}'
  [^0] (re)
  $  rm -f /tmp/ringpop-admin-dump-test.json
