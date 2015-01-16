'use strict';

var moment = require('moment'); 
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Serial data is a singleton.
var serialData = require('./app/utils/serialData');
var SerialPort = require('serialport').SerialPort;
var SerialParsers = require('serialport').parsers;

var gphoto2 = require('gphoto2');
var GPhoto = new gphoto2.GPhoto2();
var fs = require('fs');

// The data since start.
var sensorData = {
  temp: [],
  mic: [],
  pir: []
};

///////////////////////////////////////////////////////////
// Setup Camera.

// When the server starts the camera should already have been picked.
// If is not available too bad.
var camera = null;
GPhoto.list(function (list) {
  if (list.length === 0) {
    console.log('No cameras');
    return;
  }

  camera = list[0];
  console.log('Found', camera.model);
});

///////////////////////////////////////////////////////////
// Setup Arduino connection through serialport.

var serialport = new SerialPort('/dev/ttyACM0', {
  baudrate: 115200,
  // defaults for Arduino serial communication
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false,
  parser: SerialParsers.readline('\r')
});

serialport.on('open', function(){
  console.log('Serial Port Opened');
})
.on('data', function(data) {
  // Send data for processing.
  serialData.process(data);
});

// SerialData listener
serialData.listen('tempReading', '^TMP:-?([0-9]+\.[0-9]+)$');
serialData.listen('micReading', '^MIC:-?([0-1])$');
serialData.listen('pirReading', '^PIR:-?([0-1])$');

// SerialData events.
serialData.on('sysnote', function(data) {
  if (data === 'Setup Complete') {
    // Arduino is setup.
    console.log('Setup Complete');
    startServer();
  }
})
.on('debug', function(data) {
  console.log('DBG:', data);
})
.on('other', function(data) {
  // All data not processes comes here.
  console.log('UNKNOWN:', data);
});

serialData.on('tempReading', function(tmp) {
  tmp = parseFloat(tmp);
  var date = moment().format('YYYY-MM-DD H:mm:ss');
  var data = {
    date: date,
    value: tmp
  };
  sensorData.temp.push(data);
  console.log(date, data);

  // Send via websocket
  io.emit('tempReading', data);
});

serialData.on('micReading', function(tmp) {
  var soundDetected = parseInt(tmp) === 1;
  var date = moment().format('YYYY-MM-DD H:mm:ss');
  var data = {
    date: date,
    value: soundDetected
  };
  sensorData.mic.push(data);
  console.log(date, data);

  // Send via websocket
  io.emit('micReading', data);
});

serialData.on('pirReading', function(tmp) {
  var motionDetected = parseInt(tmp) === 1;;
  var date = moment().format('YYYY-MM-DD H:mm:ss');
  var data = {
    date: date,
    value: motionDetected
  };
  sensorData.pir.push(data);
  console.log(date, data);

  // Send via websocket
  io.emit('pirReading', data);

  if (motionDetected && camera !== null) {
    // Take picture with camera;
    camera.takePicture({download: true}, function (er, data) {
      var name = Date.now() + '.jpg';
      fs.writeFileSync(__dirname + '/photos/' + name, data);
      io.emit('pirPhoto', name);
    });
  }
  
});

///////////////////////////////////////////////////////////
// Express


app.use('/photos/', express.static('photos'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/app/views/index.html');
});

///////////////////////////////////////////////////////////
// Socket.io
io.on('connection', function(socket) {
  console.log('a user connected');
  io.emit('initialData', sensorData);
});

function startServer() {
  http.listen(3000, function () {
    console.log('App listening at http:localhost:3000');
  });
}

