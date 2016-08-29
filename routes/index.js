'use strict';
const h = require('../helpers');
const passport = require('passport');
const config = require('../config');

module.exports = function(){
    let routes = {
        'get': {
            '/': function(req,res,next){
                res.render('login');
            },

            '/rooms': [h.isUserAuthenticated,function(req,res,next){
                res.render('rooms',{
                    user: req.user,
                    host: config.host
                });
            }],

            '/chat/:id': [h.isUserAuthenticated,function(req,res,next){
                // Find a chatroom if it exist
                // Render it if the id is found
                let roomInfo = h.findRoomById(req.app.locals.chatrooms,req.params.id);
                if(roomInfo === undefined){
                    return next();
                } else{
                    res.render('chatroom',{
                         user: req.user,
                         host: config.host,
                         room: roomInfo.room,
                         roomID: roomInfo.roomID
                    })
                };
            }],

            '/auth/facebook': passport.authenticate('facebook'),
            '/auth/facebook/callback': passport.authenticate('facebook', {
                successRedirect:'/rooms',
                failureRedirect:'/'
            }),

            '/auth/twitter': passport.authenticate('twitter'),
            '/auth/twitter/callback': passport.authenticate('twitter', {
                successRedirect:'/rooms',
                failureRedirect:'/'
            }),

            '/logout': function(req,res,next){
                req.logout();
                console.log(req.url);
                res.redirect('/');
            }
        },

        'post': {

        },

        'NA': function(req,res,next){
            res.status(404).sendFile(process.cwd() + '/views/404.htm');
        }
    };

    return h.route(routes);
};
