Top command success:

  $  ringpop-admin top -R 127.0.0.1:3000
  \x1bcA cluster of 5 nodes have converged on a single membership view. (esc)
  It took *ms to report the stats below. (glob)
  
  Last fetch: ????-??-??T??:??:??.???? (10s) (glob)
  
  \x1b[107m\x1b[32m   All   \x1b[39m\x1b[49m\x1b[47m\x1b[30m   P1   \x1b[39m\x1b[49m (esc)
  
   Address          P1    
   \x1b[36m127.0.0.1:3000\x1b[39m   \x1b[36malive\x1b[39m  (esc)
   127.0.0.1:3001   alive 
   127.0.0.1:3002   alive 
   127.0.0.1:3003   alive 
   127.0.0.1:3004   alive 
   1 of 5

With bootstrap file:

  $  ringpop-admin top -R file://$TESTDIR/hosts.json
  \x1bcA cluster of 5 nodes have converged on a single membership view. (esc)
  It took *ms to report the stats below. (glob)
  
  Last fetch: ????-??-??T??:??:??.???? (10s) (glob)
  
  \x1b[107m\x1b[32m   All   \x1b[39m\x1b[49m\x1b[47m\x1b[30m   P1   \x1b[39m\x1b[49m (esc)
  
   Address          P1    
   \x1b[36m127.0.0.1:3000\x1b[39m   \x1b[36malive\x1b[39m  (esc)
   127.0.0.1:3001   alive 
   127.0.0.1:3002   alive 
   127.0.0.1:3003   alive 
   127.0.0.1:3004   alive 
   1 of 5
