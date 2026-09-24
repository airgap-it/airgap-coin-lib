'use strict';

var Buffer = require('../../safe-buffer-5.2.0/index').Buffer;
var toBuffer = require('../../to-buffer-1.2.2/index');

var useUint8Array = typeof Uint8Array !== 'undefined';
var useArrayBuffer = useUint8Array && typeof ArrayBuffer !== 'undefined';
var isView = useArrayBuffer && ArrayBuffer.isView;

module.exports = function (thing, encoding, name) {
	if (
		typeof thing === 'string'
		|| Buffer.isBuffer(thing)
		|| (useUint8Array && thing instanceof Uint8Array)
		|| (isView && isView(thing))
	) {
		return toBuffer(thing, encoding);
	}
	throw new TypeError(name + ' must be a string, a Buffer, a Uint8Array, or a DataView');
};
