'use strict';

const express = require('express');
const app = express();
const chat = require('./app');
const passport = require('passport');
const morgan = require('morgan');

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');

app.use('/', express.static(__dirname + '/public'));

app.use('/', chat.session);
app.use('/', passport.initialize());
app.use('/', passport.session());
app.use(morgan('combined',{
	stream:{
		write:function(message){
			//write log
			chat.logger.log('info',message);
		}
	}
}));
app.use('/', chat.router);



chat.socketIOServer(app).listen(app.get('port'), function(){
    console.log('port3000 is running');
});
