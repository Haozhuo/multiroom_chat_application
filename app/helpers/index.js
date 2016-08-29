'use strict';
const router = require('express').Router();
const db = require('../db');
let crypto = require('crypto');

let _registerRoutes = function(routes, method){
    for(var key in routes){
        if(typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)){
            _registerRoutes(routes[key], key);
        } else{
            if(method === 'get'){
                router.get(key, routes[key]);
            } else if(method === 'post'){
                router.post(key, routes[key]);
            } else{
                router.use(routes[key]);
            }
        }
    }
};

let route = function(routes){
    _registerRoutes(routes);
    return router;
};

//Find a single user based on id
let findUser = function(profileID){
        return db.userModel.findOne({
            "profileID": profileID
        });
};

//create a new user
let createNewUser = function(profile){
    return new Promise(function(resolve, reject){
        let newChatUser = new db.userModel({
            "profileID": profile.id,
            "fullName": profile.displayName,
            "profilePic": profile.photos[0].value || ""
        });

        newChatUser.save(function(err){
            if(err){
                console.log('create new user error');
                reject(err);
            } else{
                resolve(newChatUser);
            }
        });
    });
}

let findById = function(id){
    return new Promise(function(resolve, reject){
        db.userModel.findById(id, function(err, user){
            if(err)
                reject(err);
            else {
                resolve(user);
            }
        });
    });
};

let isUserAuthenticated = function(req,res,next){
    if(req.isAuthenticated()){
        next();
    } else{
        res.redirect('/');
    }
};

let findRoomByName = function(rooms, room){
    let findRoom = rooms.findIndex(function(element,index,array){
        if(element.room === room){
            return true;
        } else
            return false; 
    });

    return (findRoom > -1 ? true : false);     
}

let findRoomById = function(rooms, roomID){
    return rooms.find(function(element,index,array){
        if(element.roomID === roomID){
            return true;
        } else{
            return false;
        }
    });
}


//generate a unique ID
let idGenerator = function(){
    return crypto.randomBytes(24).toString('hex');
};


let addUserToRoom = function(rooms, data, socket){
    let room = findRoomById(rooms, data.roomID);
    if(room !== undefined){
        //get the userID
        let userID = socket.request.session.passport.user;
        
        let isUserExist = room.users.findIndex(function(element,index,array){
            if(element.userID === userID){
                return true;
            }else{
                return false;
            }
        });
        //if user exist
        if(isUserExist !== -1){
            room.users.splice(isUserExist,1);
        } 

        room.users.push({
            socketID: socket.id,
            userID,
            user: data.user,
            userPic: data.userPic
        });

        //join the room channel
        socket.join(data.roomID);

        return room;
    }
};


let removeUserFromRoom = function(rooms,socket){
    
    for(let room of rooms){
        //Find that user
            let user = room.users.findIndex(function(element,index,array){
            if(element.socketID === socket.id){
                return true;
            }else{
                return false;
            }
        });
        //if found
        if(user > -1){
             console.log("found")
            //leave that room
            socket.leave(room.roomID);
            //delete user
            room.users.splice(user,1);
            return room;
        }
    }
};


module.exports = {
    route: route,
    findUser: findUser,
    createNewUser: createNewUser,
    findById: findById,
    isUserAuthenticated: isUserAuthenticated,
    findRoomByName: findRoomByName,
    findRoomById: findRoomById,
    idGenerator: idGenerator,
    addUserToRoom: addUserToRoom,
    removeUserFromRoom: removeUserFromRoom
};
