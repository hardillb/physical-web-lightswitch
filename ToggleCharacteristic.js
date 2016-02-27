var bleno = require('bleno');
var util = require('util');

function ToggleCharacteristic(callback) {
  bleno.Characteristic.call(this, {
    uuid: '6bcb06e2747542a9a62a54a1f3ce11e6',
    properties: ['read', 'write', 'notify'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'Switch'
        })
      ]
  });

  this._state = false;
  this._callback = callback;
}

util.inherits(ToggleCharacteristic, bleno.Characteristic);

ToggleCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  // console.log("Toggle Write request " + data.toString('hex'));
  // console.log("Toggle Write request offset " + offset);

  var s = data.readUInt8(0);
  // console.log(s);
  if (s) {
    this._state = true;
  } else {
    this._state = false;
  }
  this._callback(this._state);
  

  callback(this.RESULT_SUCCESS);
}


ToggleCharacteristic.prototype.onReadRequest = function(offset, callback) {
  // console.log("Toggle READING: " + this._state.toString());
  // console.log("Toggle OFFSET: " + offset);
  var buf = new Buffer(1);
  if (this._state) {
    buf.writeUInt8(1);
    callback(this.RESULT_SUCCESS, buf);
  } else {
    buf.writeUInt8(0);
    callback(this.RESULT_SUCCESS, buf);
  }
}

ToggleCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  this._updateValueCallback = updateValueCallback;
}

ToggleCharacteristic.prototype.onUnsubscribe = function () {
  this._updateValueCallback = null;
}

ToggleCharacteristic.prototype.update = function(value) {
  this._state = value;
  console.log(this._state.toString());
  if (this._updateValueCallback) {
    var buf = new Buffer(1);
    buf.writeUInt8(this._state);
    this._updateValueCallback(buf);
  }
}

module.exports = ToggleCharacteristic;