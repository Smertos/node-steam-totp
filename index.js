'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crypto = require('crypto');
var https = require('https');

require('@doctormckay/stats-reporter').setup(require('./package.json'));
var request = function (options) { return new Promise(function (resolve, reject) {
    var req = https.request(options, function (res) {
        if (res.statusCode !== 200) {
            reject(new Error('HTTP error ' + res.statusCode));
        }
        var response = '';
        res.on('data', function (chunk) { return response += chunk; });
        res.on('end', function () { return resolve(response); });
    });
    req.on('error', function (err) { return reject(err); });
    req.end();
}); };
function time(timeOffset) {
    if (timeOffset === void 0) { timeOffset = 0; }
    return Math.floor(Date.now() / 1000) + timeOffset;
}
function generateAuthCode(secret, timeOffset) {
    if (timeOffset === void 0) {
        return getTimeOffset().then(function (_a) {
            var offset = _a[0], latency = _a[1];
            return generateAuthCode(secret, offset);
        });
    }
    var bSecret = bufferizeSecret(secret);
    var offTime = time(timeOffset);
    var buffer = Buffer.allocUnsafe(8);
    buffer.writeUInt32BE(0, 0);
    buffer.writeUInt32BE(Math.floor(offTime / 30), 4);
    var hmac = crypto.createHmac('sha1', bSecret)
        .update(buffer)
        .digest();
    var start = hmac[19] & 0x0F;
    hmac = hmac.slice(start, start + 4);
    var fullcode = hmac.readUInt32BE(0) & 0x7FFFFFFF;
    var chars = '23456789BCDFGHJKMNPQRTVWXY';
    var code = '';
    for (var i = 0; i < 5; i++) {
        code += chars.charAt(fullcode % chars.length);
        fullcode /= chars.length;
    }
    return Promise.resolve(code);
}
var getAuthCode = generateAuthCode;
function generateConfirmationKey(identitySecret, time, tag) {
    var bSecret = bufferizeSecret(identitySecret);
    var dataLen = 8;
    if (tag)
        dataLen += Math.min(32, tag.length);
    var buffer = Buffer.allocUnsafe(dataLen);
    buffer.writeUInt32BE(0, 0);
    buffer.writeUInt32BE(time, 4);
    if (tag)
        buffer.write(tag, 8);
    return crypto.createHmac('sha1', bSecret)
        .update(buffer)
        .digest('base64');
}
var getConfirmationKey = generateConfirmationKey;
function getTimeOffset() {
    var start = Date.now();
    return request({
        hostname: 'api.steampowered.com',
        path: '/ITwoFactorService/QueryTime/v1/',
        method: 'POST',
        headers: { 'Content-Length': 0 }
    }).then(function (response) {
        try {
            var resp = JSON.parse(response).response;
        }
        catch (e) {
            throw new Error('Malformed response');
        }
        if (!resp || !resp.server_time) {
            throw new Error('Malformed response');
        }
        var end = Date.now();
        var offset = resp.server_time - time();
        return [offset, end - start];
    });
}

function getDeviceID(steamID) {
    return 'android:' + crypto.createHash('sha1')
        .update(steamID.toString())
        .digest('hex')
        .replace(/^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12}).*$/, '$1-$2-$3-$4-$5');
}
function bufferizeSecret(secret) {
    if (!(secret instanceof Buffer)) {
        if (secret.match(/[0-9a-f]{40}/i)) {
            return Buffer.from(secret, 'hex');
        }
        else {
            return Buffer.from(secret, 'base64');
        }
    }
    return secret;
}

exports.time = time;
exports.generateAuthCode = generateAuthCode;
exports.getAuthCode = getAuthCode;
exports.generateConfirmationKey = generateConfirmationKey;
exports.getConfirmationKey = getConfirmationKey;
exports.getTimeOffset = getTimeOffset;
exports.getDeviceID = getDeviceID;
