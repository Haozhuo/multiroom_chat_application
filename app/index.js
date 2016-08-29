'use strict';

require('./auth')();
let config = require("./config");
let redis = require('redis');
let adapter = require('socket.io-redis');

//create a Socket IO server instance
let socketIOServer = function(app){
	app.locals.chatrooms=[];
	let server = require('http').Server(app);
	let io = require('socket.io')(server);
	//force the use of websocket
	io.set('transports',['websocket']);
	//publish
	let pubClient = redis.createClient(config.redis.port,config.redis.host,{
		auth_pass: config.redis.password
	});
	//receive
	let subClient = redis.createClient(config.redis.port,config.redis.host,{
		return_buffers: true,
		auth_pass: config.redis.password
	});


	require("./socket")(io,app);

	//adapter
	io.adapter(adapter({
		pubClient,
		subClient
	}));


	io.use(function(socket,next){
		require('./session')(socket.request,{}, next);
	});
	return server;
}


module.exports = {
    router: require('./routes')(),
    session: require('./session'),
    socketIOServer: socketIOServer,
    logger: require('./logger')
};
