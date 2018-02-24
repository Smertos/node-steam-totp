require('@doctormckay/stats-reporter').setup(require('./package.json'));

import { createHash, createHmac } from 'crypto';
import { IncomingMessage } from 'http';
import { request as _request } from 'https';
import { promisify } from 'util';

const request = (options: object): Promise<string> => new Promise((resolve, reject) => {
    const req = _request(options, (res: IncomingMessage) => {
        if (res.statusCode !== 200) {
            reject(new Error('HTTP error ' + res.statusCode));
        }

        let response = '';
        res.on('data', (chunk: string) => response += chunk);
        res.on('end', () => resolve(response));
    });
    req.on('error', err => reject(err));
    req.end();
});

/**
 * Returns the current local Unix time
 * @param {number} [timeOffset=0] - This many seconds will be added to the returned time
 * @returns {number}
 */
export function time (timeOffset: number = 0): number {
    return Math.floor(Date.now() / 1000) + timeOffset;
}

/**
 * Generate a Steam-style TOTP authentication code.
 * @param {Buffer|string} secret - Your TOTP shared_secret as a Buffer, hex, or base64
 * @param {number} [timeOffset=0] - If you know how far off your clock is from the Steam servers, put the offset here in seconds
 * @returns {Promise<string>}
 */

export function generateAuthCode(secret: Buffer|string, timeOffset?: number): Promise<string> {
    if (timeOffset === void 0) {
        return getTimeOffset().then(
            ([offset, latency]) =>
                generateAuthCode(secret, offset)
        );
    }
    
    const bSecret = bufferizeSecret(secret);
    const offTime = time(timeOffset);
    const buffer = Buffer.allocUnsafe(8);

    buffer.writeUInt32BE(0, 0); // This will stop working in 2038!
    buffer.writeUInt32BE(Math.floor(offTime / 30), 4);

    let hmac = createHmac('sha1', bSecret)
        .update(buffer)
        .digest();

    let start = hmac[19] & 0x0F;
    hmac = hmac.slice(start, start + 4);

    let fullcode = hmac.readUInt32BE(0) & 0x7FFFFFFF;

    const chars = '23456789BCDFGHJKMNPQRTVWXY';

    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(fullcode % chars.length);
        fullcode /= chars.length;
    }

    return Promise.resolve(code);
}
export const getAuthCode = generateAuthCode;

/**
 * Generate a base64 confirmation key for use with mobile trade confirmations. The key can only be used once.
 * @param {Buffer|string} identitySecret - The identity_secret that you received when enabling two-factor authentication
 * @param {number} time - The Unix time for which you are generating this secret. Generally should be the current time.
 * @param {string} tag - The tag which identifies what this request (and therefore key) will be for. "conf" to load the confirmations page, "details" to load details about a trade, "allow" to confirm a trade, "cancel" to cancel it.
 * @returns {string}
 */
export function generateConfirmationKey (identitySecret: Buffer|string, time: number, tag: string): string {
    const bSecret = bufferizeSecret(identitySecret);

    let dataLen = 8;

    if (tag) dataLen += Math.min(32, tag.length);

    let buffer = Buffer.allocUnsafe(dataLen);
    buffer.writeUInt32BE(0, 0); // This will stop working in 2038!
    buffer.writeUInt32BE(time, 4);

    if (tag) buffer.write(tag, 8);

    return createHmac('sha1', bSecret)
        .update(buffer)
        .digest('base64');
}
export const getConfirmationKey = generateConfirmationKey;

/**
 * Do request to steam api & measure the delay from request start to it's end
 * @return {Promise<number[]>}
 */
export function getTimeOffset (): Promise<[number, number]> {
    let start = Date.now();

    return request({
        hostname: 'api.steampowered.com',
        path: '/ITwoFactorService/QueryTime/v1/',
        method: 'POST',
        headers: { 'Content-Length': 0 }
    }).then((response: string): [number, number] => {
        try {
            var resp: any = JSON.parse(response).response;
        } catch(e) {
            throw new Error('Malformed response');
        }

        if (!resp || !resp.server_time) {
            throw new Error('Malformed response');
        }

        let end = Date.now();
        let offset = resp.server_time - time();

        return [offset, end - start];
    });
};

/**
 * Get a standardized device ID based on your SteamID.
 * @param {string|object} steamID - Your SteamID, either as a string or as an object which has a toString() method that returns the SteamID
 * @returns {string}
 */
export function getDeviceID (steamID: string|{ toString: () => string }): string {
    return 'android:' + createHash('sha1')
        .update(steamID.toString())
        .digest('hex')
        .replace(/^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12}).*$/, '$1-$2-$3-$4-$5');
}

function bufferizeSecret(secret: Buffer|string) {
    if (!(secret instanceof Buffer)) {
        // Check if it's hex
        if (secret.match(/[0-9a-f]{40}/i)) {
            return Buffer.from(secret, 'hex');
        } else {
            // Looks like it's base64
            return Buffer.from(secret, 'base64');
        }
    }

    return secret;
}


