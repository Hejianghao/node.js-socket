function divEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket){
	var message = $('#send-message').val();
	var systemMessage;
	if (message.charAt(0) == '/') { //如果是系统命令
		systemMessage = chatApp.processCommand(message);
		if (systemMessage) {
			$('#messages').append(divSystemContentElement(systemMessage));
		}
	} else {//如果是发送消息
		chatApp.sendMessage($('#room').text(), message);
		$('#messages').append(divEscapedContentElement(message));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}
	$('#send-message').val('');
}

var socket = io.connect('http://localhost');
$(function(){
	var chatApp = new Chat(socket);
	socket.on('nameResult', function(result){
		var message;
		if (result.success) {
			message = 'You are now know as ' + result.name + '.';
		} else {
			message = result.message;
		}
		$('#messages').append(divSystemContentElement(message));
	});

	socket.on('joinResult',function(result){
		$('#room').text(result.room);
		$('#message').append(divSystemContentElement('Room changed.'));
	});

	
	socket.on('message',function(message){
		var newElement = $('<div></div>').text(message.text);
		$('#messages').append(newElement);
	});
	socket.on('rooms',function(rooms){
		//console.log(rooms + '......');
		$('#room-list').empty();
		for (var room in rooms){
			room = room.substring(1, rooms.length);
			if (room != '') {
				$('#room-list').append(divEscapedContentElement(room));
			}
		}
		$('#room-list div').on('click',function(){
			chatApp.processCommand('/join ' + $(this).text());
			$('#send-message').focus();
		});
	});

	setInterval(function() {
		socket.emit('rooms');
	},1000);

	$('#send-message').focus();

	$('#send-button').on('click',function() {
		processUserInput(chatApp, socket);
		return false;
	});
	/*
	document.onkeydown = function(event){
		if(event.keyCode == 13) {
			alert(event.keyCode);
			processUserInput(chatApp, socket);
			return false;
		}
	};
	*/
});


