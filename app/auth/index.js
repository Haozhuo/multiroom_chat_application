'use strict';

const passport = require('passport');
const config = require('../config');
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy= require('passport-twitter').Strategy;
const helper = require('../helpers');
const logger = require('../logger');

module.exports = function(){
    passport.serializeUser(function(user, done){
        console.log("serialize");
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        console.log('deserilizing');
        helper.findById(id).then(function(result){
                done(null, result);
        }).catch(function(err){
            logger.log("error", 'error when deserilizing user ' + err);
        });
    });


    let auth = function(accessToken, refreshToken, profile, done){
        helper.findUser(profile.id)
              .then(function(result){
                  if(result){
                      done(null, result);
                  } else{
                      //create a new user
                      helper.createNewUser(profile).then(function(result){
                          done(null, result);
                      }).catch(function(err){
                          logger.log("error", 'error when creating user ' + err);
                      });
                  }
              });
    };

    passport.use(new FacebookStrategy(config.fb, auth));
    passport.use(new TwitterStrategy(config.twitter, auth));
};
