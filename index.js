var bleno = require('bleno');
var eddystone = require('eddystone-beacon');

var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');

var BlenoPrimarySerivce = bleno.PrimaryService;
var ToggleCharacteristic = require('./ToggleCharacteristic');
var RangeCharacteristic = require('./RangeCharacteristic');

var config = require('./config.js');

var deviceID = config.deviceID;
var device;

var WeMoNG = require('./lib/wemo');
var wemo = new WeMoNG();

var interval = setInterval(wemo.start.bind(wemo), 60000);
wemo.start();

if (!wemo.get(deviceID)) {
  wemo.on('discovered', function(d){
    if (d === deviceID) {
      device = wemo.get(d);
      console.log("found light configured Light");
    }
  });
} else {
  device = wemo.get(deviceID);
  console.log("found light configured Light");
}

var app = express();

app.use(express.static('static'));

app.post('/toggle/:on', function(req, res){
  console.log("web toggle " + req.params.on);
  if (req.params.on === 'on') {
    wemo.setStatus(device,'10006',1);
  } else {
    wemo.setStatus(device,'10006',0);
  }
  res.send();
});

app.post('/dim/:range', function(req,res){
  console.log("web dim " + req.params.range);
  wemo.setStatus(device,'10006,10008','1,' + req.params.range);
  res.send();
});

if (config.cert && config.key) {
  var privateKey  = fs.readFileSync(config.key, 'utf8');
  var certificate = fs.readFileSync(config.cert, 'utf8');
  var credentials = {key: privateKey, cert: certificate};
  var httpsServer = https.createServer(credentials, app);
  httpsServer.listen(config.port);
} else {
  var httpServer = http.createServer(app);
  httpServer.listen(config.port);
}


function bleToggleCallback(state) {
  console.log("bleToggle - " + state);
  if (state == 'on') {
    wemo.setStatus(device,'10006',1);
  } else {
    wemo.setStatus(device,'10006',0);
  }
}

function bleDimCallback(state) {
  console.log("bleDim - " + state);
  if (state >0) {
    wemo.setStatus(device,'10006,10008','1,' + state);
  }
}

var toggle = new ToggleCharacteristic(bleToggleCallback);
var dim = new RangeCharacteristic(bleDimCallback);


bleno.once('advertisingStart', function(err) {
  if (err) {
    throw err;
  }

  bleno.setServices([
    new BlenoPrimarySerivce({
		uuid: 'ba42561bb1d2440a8d040cefb43faece',
		characteristics: [
			toggle,
      dim
		]
	})
  ]);
});

eddystone.advertiseUrl(config.shortURL, {name: config.name});
