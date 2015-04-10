var util = require('util');
var net = require('net');
var mqtt = require('mqtt');

var HOST = '0.0.0.0';
var epPORT = 6969;
var svPORT = 6868;
var MQTTSERVER = 'mqtt://do.xavierzip.com';	// MQTT Server Address


// Create a TCP server for endpoint client connections
net.createServer(function (sock){
	console.log('CONNECTED' + sock.remoteAddress + ':' + sock.remotePort);
	sock.isNew = true;	// Label that this is a new socket
	sock.on('data',function(data){
		sock.write(data);
		// if(sock.isNew === true){
		// 	// if this is a new endpoint client connection
		// 	console.log(util.inspect(data));
		// 	console.log(data.toString());
		// 	if(true){
		// 		// Currently there is no decision making condition
		// 		var id = data[2]*256*256 + data[1]*256 + data[0];
		// 		console.log(id);
		// 		if(id > 14000000){
		// 			// For T61 devices
		// 			sock.deviceName = 'T61A'+id.toString();
		// 		}else{
		// 			sock.deviceName = 'T51A'+id.toString();
		// 		}
		// 		console.log('Endpoint client: ' + sock.deviceName);
		// 		sock.isNew = false;
		// 		sock.mqttClient = mqtt.connect(MQTTSERVER);
		// 		sock.mqttClient.on('connect', function(){
		// 			console.log('MQTT Server connected');
		// 			sock.mqttClient.subscribe(sock.deviceName+'S');
		// 		});			
		// 		sock.mqttClient.on('message', function(topic, message){
		// 			// console.log(util.inspect(message));
		// 			sock.write(message);
		// 		});			
		// 	}else{
		// 		// Client is sending random data
		// 		// Close the connection
		// 		sock.destroy();					
		// 	}

		// }else{
		// 	console.log('Rx: '+util.inspect(data));
		// 	sock.mqttClient.publish(sock.deviceName+'S', data);
		// }
	});
	sock.on('close', function(data){
		// sock.mqttClient.end();
		console.log('CLOSED: '+ sock.deviceName+'E');
	})
}).listen(epPORT,HOST);

console.log('Server listening on '+HOST+':'+epPORT);

// Create a TCP server for Server client connections
net.createServer(function (sock){
	console.log('CONNECTED' + sock.remoteAddress + ':' + sock.remotePort);
	sock.isNew = true;	// Label that this is a new socket
	sock.on('data',function(data){
		if(sock.isNew === true){
			// if this connection is a new conection from server application
			console.log(util.inspect(data));
			console.log(data.toString());
			if(data[0] === 0x69 && data[1] === 0x64){	// Check the data
				sock.conType = 0;
				var id = data.slice(4).toString();
				sock.deviceName = 'T'+id.toUpperCase();				
				console.log(sock.deviceName);
				sock.isNew = false;
				console.log('Server client: ' + sock.deviceName);
				sock.mqttClient = mqtt.connect(MQTTSERVER);
				sock.mqttClient.on('connect', function(){
					console.log('MQTT Server connected');
					sock.mqttClient.subscribe(sock.deviceName+'S');
				});	
				sock.mqttClient.on('message', function(topic, message){
					console.log(util.inspect(message));
					sock.write(message);
				});
			}else{
				// Client is sending random data
				// Close the connection
				sock.destroy();		
			}

		}else{
			console.log('Rx: '+util.inspect(data));
			sock.mqttClient.publish(sock.deviceName+'E', data);
		}
	});
	sock.on('close', function(data){
		if(sock.mqttClient in sock){
			sock.mqttClient.end();
			console.log('CLOSED: '+ sock.deviceName+'S');
		}else{
			console.log('CLOSED unknow connection');
		}
	})
}).listen(svPORT,HOST);

console.log('Server listening on '+HOST+':'+svPORT);
