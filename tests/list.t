Test list command success:

  $  ringpop-admin list -h 127.0.0.1:3000
  127.0.0.1

  $  ringpop-admin list -m 127.0.0.1:3000
  127.0.0.1:3000
  127.0.0.1:3001
  127.0.0.1:3002
  127.0.0.1:3003
  127.0.0.1:3004

With explicit ringpop:

  $  ringpop-admin list -h ringpop://127.0.0.1:3000
  127.0.0.1
  $  ringpop-admin list -m ringpop://127.0.0.1:3000
  127.0.0.1:3000
  127.0.0.1:3001
  127.0.0.1:3002
  127.0.0.1:3003
  127.0.0.1:3004

With bootstrap file:

  $  ringpop-admin list -h file://$TESTDIR/hosts.json
  127.0.0.1
  $  ringpop-admin list -m file://$TESTDIR/hosts.json
  127.0.0.1:3000
  127.0.0.1:3001
  127.0.0.1:3002
  127.0.0.1:3003
  127.0.0.1:3004