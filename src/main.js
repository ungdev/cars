var five = require('johnny-five');
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
var arduino = new five.Board();

arduino.on("ready", function() {
    console.log("Ready!");
    server.listen(8080);

    this.pinMode(9, five.Pin.PWM);
});


/*
    I/O
 */
var player1Ready = false;
var player1Min   = 0;
var player1Max   = 255;

var player2Ready = false;
var player2Min   = 0;
var player2Max   = 255;


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
        console.log('ici');
        var pwm;
        if (parseInt(data.target) === 1){
            pwm = player1Min + (player1Max - player1Min) * parseFloat(data.speed);
        }
        else {
            pwm = player2Min + (player2Max - player2Min) * parseFloat(data.speed);
        }

        pwm = parseInt(pwm, 10);

        try {
            arduino.analogWrite(9, pwm);
        }
        catch(e) {}
    });
});
