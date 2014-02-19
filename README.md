This module was implemented redis queue.

It use node_redis module:  [node_redis](https://github.com/mranney/node_redis)

## INSTALL

npm install redismq

## example

```
// require 

var redismq = require("redismq");

// You can use base function of node_redis module.

redismp.hset("key", "field", "value");

// pubPush (push value + send message )

redisq.pubPush("key name", "push value");

// waitPop (subscribe message + pop value)

var getPubQueueValue = function (err, value){
 
 console.log("wait pop queue : " + value);	

}

redisq.waitPop("key name", getPubQueueValue);

```
