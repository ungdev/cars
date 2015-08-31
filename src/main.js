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
var player1Ready = false;
var player1Min   = 100;
var player1Max   = 150;

var player2Ready = false;
var player2Min   = 0;
var player2Max   = 50;


io.on('connection', function (socket) {
    socket.on('ready', function(data) {
        if (parseInt(data.player) === 1) {
            player1Ready = true;
        }
        else {
            player2Ready = true;
        }

        // If both players are ready, go
        if (player1Ready && player2Ready) {
            io.sockets.emit('launch');

            // Reset for next game
            player1Ready = false;
            player2Ready = false;
        }
    });

    socket.on('update', function(data) {
        var pwm;
        if (parseInt(data.target) === 1){
            pwm = player1Min + (player1Max - player1Min) * parseFloat(data.speed);
        }
        else {
            pwm = player1Min + (player1Max - player1Min) * parseFloat(data.speed);
        }

        try {
            arduino.devices['pin'+data.target].pwmWrite(pwm);
        }
        catch(e) {}
    });
});