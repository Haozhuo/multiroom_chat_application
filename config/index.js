'use strict';

if(process.env.NODE_ENV === 'production'){
    let redis_uri = require('url').parse(process.env.REDIS_URL);
    let redis_password = redis_uri.auth.split(":")[1];
    module.exports = {
        host: process.env.host || "",
        dbURI: process.env.dbURI,
        sessionSecret: process.env.sessionSecret,
        fb:{
            "clientID":process.env.fbClientID,
            "clientSecret": process.env.fbClientSecret,
            "callbackURL": process.env.host + "/auth/facebook/callback",
            "enableProof": true,
            "profileFields": ["id", "displayName", "photos"]
        },

        twitter:{
            "consumerKey": process.env.twConsumerKey,
            "consumerSecret": process.env.twConsumerSecret,
            "callbackURL": process.env.host + "/auth/twitter/callback",
            "profileFields": ["id", "displayName", "photos"]
        },

        redis:{
            "host":redis_uri.hostname,
            "port":redis_uri.port,
            "password":redis_password
        }
    }
} else{
    module.exports = require('./development.json');
}
