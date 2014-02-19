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

// support node_redis basic function
commands = ["get", "set", "setnx", "setex", "append", "strlen", "del", "exists", "setbit", "getbit", "setrange", "getrange", "substr",
    "incr", "decr", "mget", "rpush", "lpush", "rpushx", "lpushx", "linsert", "rpop", "lpop", "brpop", "brpoplpush", "blpop", "llen", "lindex",
    "lset", "lrange", "ltrim", "lrem", "rpoplpush", "sadd", "srem", "smove", "sismember", "scard", "spop", "srandmember", "sinter", "sinterstore",
    "sunion", "sunionstore", "sdiff", "sdiffstore", "smembers", "zadd", "zincrby", "zrem", "zremrangebyscore", "zremrangebyrank", "zunionstore",
    "zinterstore", "zrange", "zrangebyscore", "zrevrangebyscore", "zcount", "zrevrange", "zcard", "zscore", "zrank", "zrevrank", "hset", "hsetnx",
    "hget", "hmset", "hmget", "hincrby", "hdel", "hlen", "hkeys", "hvals", "hgetall", "hexists", "incrby", "decrby", "getset", "mset", "msetnx",
    "randomkey", "select", "move", "rename", "renamenx", "expire", "expireat", "keys", "dbsize", "auth", "ping", "echo", "save", "bgsave",
    "bgrewriteaof", "shutdown", "lastsave", "type", "multi", "exec", "discard", "sync", "flushdb", "flushall", "sort", "info", "monitor", "ttl",
    "persist", "slaveof", "debug", "config", "subscribe", "unsubscribe", "psubscribe", "punsubscribe", "publish", "watch", "unwatch", "cluster",
    "restore", "migrate", "dump", "object", "client", "eval", "evalsha"];

commands.forEach(function (fullCommand) {
    var command = fullCommand.split(' ')[0];
    RedisQ.prototype[command] = function (args, callback) {
        if (Array.isArray(args) && typeof callback === "function") {
            return this.client.send_command(command, args, callback);
        } else {
            return this.client.send_command(command, to_array(arguments));
        }
   	};
   	RedisQ.prototype[command.toUpperCase()] = RedisQ.prototype[command];
});

function to_array(args) {
    var len = args.length,
        arr = new Array(len), i;

    for (i = 0; i < len; i += 1) {
        arr[i] = args[i];
    }
    return arr;
}

// exposure
exports = RedisQ;

