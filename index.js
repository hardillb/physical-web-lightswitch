var bleno = require('bleno');
var eddystone = require('eddystone-beacon');

var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var morgan = require('morgan');

var BlenoPrimarySerivce = bleno.PrimaryService;
var ToggleCharacteristic = require('./ToggleCharacteristic');
var RangeCharacteristic = require('./RangeCharacteristic');
var RGBCharacteristic = require('./RGBCharacteristic');


var config = require('./config.js');

function toggleCallback(state) {
  console.log("toggle - " + state);
  if (state === 1) {
    wemo.setStatus(device,'10006',1);
  } else {
    wemo.setStatus(device,'10006',0);
  }
}

function dimCallback(state) {
  console.log("bleDim - " + state);
  if (state >0) {
    wemo.setStatus(device,'10006,10008','1,' + state);
  }
}

function rgbCallback(red, green, blue) {
  var xy = wemo.rgb2xy(red,green,blue)
  wemo.setStatus(device,'10300',xy[0] + ',' + xy[1]);
}

var toggle = new ToggleCharacteristic(toggleCallback);
var dim = new RangeCharacteristic(dimCallback);
var rgb = new RGBCharacteristic(rgbCallback);

var characteristics = [toggle, dim];


var app = express();
app.use(morgan('combined'));

app.use(express.static('static'));

app.post('/toggle/:on', function(req, res){
  console.log("web toggle " + req.params.on);
  var state = req.params.on === 'on' ? 1 : 0;
  toggleCallback(state);
  toggle.update(state);
  res.send();
});

app.post('/dim/:range', function(req,res){
  console.log("web dim " + req.params.range);
  var state = req.params.range;
  if (state) {
    toggleCallback(1);
    toggle.update(1);
    dimCallback(state);
    dim.update(state);
  } else {
    toggleCallback(0);
    toggle.update(0);
    dim.update(0);    
  }
  res.send();
});

var deviceID = config.deviceID;
var device;

var WeMoNG = require('./lib/wemo');
var wemo = new WeMoNG();

var interval = setInterval(wemo.start.bind(wemo), 60000);

wemo.on('discovered', function(d){
  if (d === deviceID) {
    device = wemo.get(d);
    console.log("found light configured " + device.name);
    // console.log("%j",device.capabilities);
    if (device.capabilities.indexOf('10300') != -1) {
      console.log("RGB enabled");
      characteristics.push(rgb);

      app.post('/rgb/:colours', function(req,res){
        var colour = req.params.colours;
        console.log("colours " + colours);
        var red = parseInt('0x' + colours.substring(0,2), 'hex');
        var green = parseInt('0x' + colours.substring(2,4), 'hex');
        var blue = parseInt('0x' + colours.substring(4,6), 'hex');
        rgbCallback(red,green,blue);
        rgb.update(red,green,blue);
      });
    }

    bleno.once('advertisingStart', function(err) {
    if (err) {
      throw err;
    }

    bleno.setServices([
      new BlenoPrimarySerivce({
      uuid: 'ba42561bb1d2440a8d040cefb43faece',
      characteristics: characteristics
    })
    ]);
  });

  eddystone.advertiseUrl(config.shortURL, {name: config.name});


  }
});
wemo.start();


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


