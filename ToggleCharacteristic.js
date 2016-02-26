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
  if (this._state != data) {
    this._state = data;
    this._callback(data);
  }

  callback(this.RESULT_SUCCESS);
}


ToggleCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log("READING: " + this._state.toString());
  console.log("OFFSET: " + offset);
  callback(this.RESULT_SUCCESS, this._value);
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
    this._updateValueCallback(this._state);
  }
}

module.exports = ToggleCharacteristic;