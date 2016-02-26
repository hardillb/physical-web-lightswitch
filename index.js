var bleno = require('bleno');
var eddystone = require('eddystone-beacon');
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
      console.log("found light");
    }
  });
} else {
  device = wemo.get(deviceID);
  console.log("found light");
}



var app = express();

app.use(express.static('static'));

app.post('/toggle/:on', function(req, res){
  console.log("toggle " + req.params.on);
  if (req.params.on === 'on') {
    wemo.setStatus(device,'10006',1);
  } else {
    wemo.setStatus(device,'10006',0);
  }
  res.send();
});

app.post('/dim/:range', function(req,res){
  console.log("dim " + req.params.range);
  wemo.setStatus(device,'10006,10008','1,' + req.params.range);
  res.send();
});

app.listen(config.port);

function bleToggleCallback(state) {
  if (state == 'on') {
    wemo.setStatus(device,'10006',1);
  } else {
    wemo.setStatus(device,'10006',0);
  }
}

function bleTDimCallback(state) {
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

eddystone.advertiseUrl(config.shortURL, {name: 'Lights'});
