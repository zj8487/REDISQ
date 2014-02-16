/**
*  This module was implemented redis queue.
*  author agun
*  License MIT
*  use node_redis (https://github.com/mranney/node_redis)
*  see https://github.com/agune/BIGMAMA-AGUN
*  see BIGMAMA PROJECT (https://github.com/PROJECT-BIGMAMA/BIGMAMA-DOC)
*/

var redis = require("redis");


/**
* Function is sending pub message. 
**/
var pubCommand =  function(client, key, value, callback){
	client.rpush(key, value, function(err, replay){
		client.publish(key, "push queue : " + replay);
		if(callback){
			callback();
		}
	})
};


// made redis queue function
RedisQ = function(port, ip){

	// connect redis and get client 
	this.client =  redis.createClient(port, ip);
	
	// subscribe client 
	this.subClient = null;
	this.port = port;      	// default 6379
	this.ip =  ip;			// default 127.0.0.1
	this.subscribe = false;
	this.subscribeCmd = null;
};


// push value in queue by publish / subscribe model
RedisQ.prototype.pubPush = function (key, value, callback){

	var client  = this.client;

	if(this.subscribe || !this.subClient){
		pubCommand(client, key, value, callback);
	}else{
		setTimeout(pubCommand, 1000, client, key, value, callback);
	}

};

// push value in queue
RedisQ.prototype.push = function (key, value){
	this.client.rpush(key, value);
};

// pop value in queue by publish / subscribe model
RedisQ.prototype.waitPop = function (key, callback){
		
		// connect subscribe client 
		if(this.subClient == null){
			this.subClient = redis.createClient(this.port, this.ip);
		}	
		
		var client = this.client;

		var self = this;
    	
    	// Client will emit subscribe in response to a SUBSCRIBE command
    	this.subClient.on("subscribe", function (channel, count) {
    		self.subscribe = true;
    		
    		if(self.subscribeCmd != null)
    			self.subscribeCmd();
    	});
   
   		// Client will emit message for every message received
		this.subClient.on("message", function (channel, message) {
    		client.lpop(key, callback);
    	});

		// try subscribe
	 	this.subClient.subscribe(key);

};

// pop value in queue
RedisQ.prototype.pop = function (key, callback){
	this.client.lpop(key, callback);
};


// set hash 
RedisQ.prototype.hset = function (key, fieldname,  value, callback){
	if(callback != null)
		this.client.hset(key, fieldname, value, callback);
	else
		this.client.hset(key, fieldname, value, function(err, value){});		
};

// get hash
RedisQ.prototype.hget = function (key, fieldname,  callback){
	this.client.hget(key, fieldname, callback);		
};

// get all hash
RedisQ.prototype.hgetall = function (key,  callback){
	this.client.hgetall(key, callback);		
};

// check subscrible ok?
RedisQ.prototype.isSubscribe = function (){
	return this.subscribe;
};

// it is extending safely subscribe function 
RedisQ.prototype.extendSubscribe= function(subscribeCmd){
	this.subscribeCmd = subscribeCmd;
};

// clear client resource
RedisQ.prototype.quit = function (){
	this.client.quit();
	if(this.subClient != null) this.subClient.quit();
};


// exposure
exports = RedisQ;

