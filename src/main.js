var Cylon = require('cylon');
var express = require('express');
var glob = require('glob');


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
var port = glob.sync('/dev/ttyCAM*')[0] || '/dev/ttyACM0';

var arduino = Cylon.robot({
    connections: {
        arduino: { adaptor: 'firmata', port: port }
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
        arduino.devices[data.target].pwmWrite(parseInt(data.pwm));
        console.log(data);
    });
});