'use strict';
let h = require('../helpers');


module.exports = function(io,app){
	let rooms = app.locals.chatrooms;

	io.of('/roomlist').on('connection',function(socket){
		socket.on('getChatRooms',function(){
			socket.emit("chatRoomList",JSON.stringify(rooms));
		});

		socket.on('createNewRoom',function(newRoom){
			//check to see if the new room exist or not
			//if not, create one
			if(!h.findRoomByName(rooms,newRoom)){
				rooms.push({
					room: newRoom,
					roomID: h.idGenerator(),
					users: []
				});

				//Emit the update list to the creator
				socket.emit('chatRoomList',JSON.stringify(rooms));
				//Emit the update list to everyone except that socket
				socket.broadcast.emit('chatRoomList',JSON.stringify(rooms));
			}
		});
	});

	io.of('/chatter').on('connection',function(socket){
		socket.on('join',function(data){
			let userList = h.addUserToRoom(rooms,data,socket);
			//emit that event to every socket connect to that room except the newly connected one
			socket.broadcast.to(data.roomID).emit('updateUserList', JSON.stringify(userList.users));
			//emit that event to the newly connected user
			socket.emit('updateUserList', JSON.stringify(userList.users));
		});
		
		socket.on('disconnect',function(){
			//When a user logs out
			let room = h.removeUserFromRoom(rooms,socket);
			//broadcast to all other users that are in the room other than that user
			socket.broadcast.to(room.roomID).emit('updateUserList',JSON.stringify(room.users));
		});

		//When a new message arrives
		socket.on('newMessage',function(data){
			socket.broadcast.to(data.roomID).emit('inMessage',JSON.stringify(data));
		});
	});
}