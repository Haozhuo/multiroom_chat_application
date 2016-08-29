'use strict';

const config = require('../config');
const Mongoose = require('mongoose').connect(config.dbURI);
const logger = require('../logger');

Mongoose.connection.on('error', function(error){
    logger.log("error",'Mongo connection error' + error);
});

//Create a schema
const chatUser = new Mongoose.Schema({
    "profileID": String,
    "fullName": String,
    "profilePic": String
});

//turn to a model
var userModel = Mongoose.model('chatUser', chatUser);

module.exports = {
    Mongoose: Mongoose,
    userModel: userModel
}
