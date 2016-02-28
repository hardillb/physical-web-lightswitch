var bleno = require('bleno');
var util = require('util');

function RGBCharacteristic(callback) {
  bleno.Characteristic.call(this, {
    uuid: '6bcb06e2747542a9a62a54a1f3ce11e7',
    properties: ['read', 'write', 'notify'],
      descriptors: [
        new bleno.Descriptor({
          uuid: '2901',
          value: 'RGB'
        })
      ]
  });

  this._red = 255;
  this._green = 255;
  this._blue = 255;
  this._callback = callback
}

util.inherits(RGBCharacteristic, bleno.Characteristic);

RGBCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  console.log("RGB Write request " + data.toString('hex'));
  var red = data.readUInt8(0);
  var green = data.readUInt8(1);
  var blue = data.readUInt8(2);
  if (this._state != dim) {
    this._state = dim;
    this._callback(dim);
  }

  callback(this.RESULT_SUCCESS);
}


RGBCharacteristic.prototype.onReadRequest = function(offset, callback) {
  console.log("READING: " + this._red + "," + this._green + "," + this._blue );
  console.log("OFFSET: " + offset);
  var buf = new Buffer(3);
  buf.writeUInt8(this._red,0);
  buf.writeUInt8(this._green,1);
  buf.writeUInt8(this._blue ,2);
  callback(this.RESULT_SUCCESS, buf);
}

RGBCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  this._updateValueCallback = updateValueCallback;
}

RGBCharacteristic.prototype.onUnsubscribe = function () {
  this._updateValueCallback = null;
}

RGBCharacteristic.prototype.update = function(red, green, blue) {
  this._red = red;
  this._green = green;
  this._blue = blue;
  console.log("UPDATE: "+ this._red + "," + this._green + "," + this._blue);
  if (this._updateValueCallback) {
    var buf = new Buffer(3);
    buf.writeUInt8(this._red,0);
    buf.writeUInt8(this._green,1);
    buf.writeUInt8(this._blue,2);
    this._updateValueCallback(buf);
  }
}

module.exports = RGBCharacteristic;