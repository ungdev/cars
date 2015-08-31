var Cylon = require('cylon');
var express = require('express');


/*
    Web server
 */
var app = express();
app.use(express.static(__dirname + '/public'));
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8080);


/*
    Arduino
 */
// TODO: automatic port detection
var arduino = Cylon.robot({
    connections: {
        arduino: { adaptor: 'firmata', port: '/dev/ttyACM0' }
    },

    devices: {
        pin1: { driver: 'direct-pin', pin: 12 },
        pin2: { driver: 'direct-pin', pin: 13 }
    }
}).start();


/*
    I/O
 */
io.on('connection', function (socket) {
    socket.on('update', function(data) {
        arduino.devices.pin1.pwmWrite(parseInt(data.pwm1));
        arduino.devices.pin2.pwmWrite(parseInt(data.pwm2));
        console.log(data);
    });
});