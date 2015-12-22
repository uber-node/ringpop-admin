Test count success:

  $  ringpop-admin count -m 127.0.0.1:3000
  5
  $  ringpop-admin count -h 127.0.0.1:3000
  1
  $  ringpop-admin count -p 127.0.0.1:3000
  1

With bootstrap file:

  $  ringpop-admin count -m file://$TESTDIR/hosts.json
  5
  $  ringpop-admin count -h file://$TESTDIR/hosts.json
  1
  $  ringpop-admin count -p file://$TESTDIR/hosts.json
  1
