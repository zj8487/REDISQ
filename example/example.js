/**
*  This is RedisQ example
*  author agun
*  License MIT
*  see https://github.com/PROJECT-BIGMAMA/REDISQ
*  see BIGMAMA PROJECT INFO (https://github.com/PROJECT-BIGMAMA/BIGMAMA-DOC)
**/

// include RedisQ module
var redisq = require("redismq");

// created RedisQ instance
redisq = new RedisQ();


var hSetValue = function (err, value){
	console.log("hSet queue : " + value);	
}

var hGetValue = function (err, value){
	console.log("hGet queue : " + value);	
}

var hGetAllValue = function (err, value){
	console.log("hGet all queue : ");
	console.dir(value);	
	console.log(value.fieldname1)
}


redisq.hset("hset_test", "fieldname1", "set value");

redisq.hset("hset_test", "fieldname2", "set value2", hSetValue);

redisq.hget("hset_test", "fieldname1", hGetValue);

redisq.hgetall("hset_test", hGetAllValue);



// push queue
redisq.push("module_test", "module_value");

redisq.push("module_test", "module_value2");

redisq.push("module_test", "module_value3");
// This is function when obtain data by pop.
var getQueueValue = function (err, value){
	console.log("pop queue : " + value);	
}

// pop queue
redisq.pop("module_test", getQueueValue);


/**
* You can push in queue by pub/sub model safely.
* if Publish / Subscribe use on one process,
* You must use below.
*/
 
var pubPushCmd =  function(){
	redisq.pubPush("pub_test", "sending value3");
	redisq.pubPush("pub_test", "sending value4");
	redisq.pubPush("pub_test", "sending value5");
}
redisq.extendSubscribe(pubPushCmd);

var count = 0;
var getPubQueueValue = function (err, value){
	count++;
	console.log("pub pop queue : " + value);	
	if(count == 3){
		redisq.quit();
	}

}


// pub /sub model test
redisq.waitPop("pub_test", getPubQueueValue);
/**
You can push in queue by pub/sub model (not safely)
one second delay because synchronize subscribe.

redisq.pubPush("pub_test", "sending value3");
redisq.pubPush("pub_test", "sending value4");
redisq.pubPush("pub_test", "sending value5");
*/

// check asynchronous
console.log("end line");

