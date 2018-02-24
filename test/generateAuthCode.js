const { expect } = require('chai');
const { describe, it } = require('mocha');
const { generateAuthCode } = require('../index.js');

describe('generateAuthCode', () => {
    const secret = '*insert funny comment here*';
    const dewIt = (iSecret, timeOffset) => generateAuthCode(iSecret, timeOffset)
    const dewItBuffer = (iSecret, timeOffset) => generateAuthCode(Buffer(iSecret), timeOffset)

    it('return string from string', () => expect(dewIt(secret)));
    it('return string from buffer', () => expect(dewItBuffer(Buffer(secret))));

    it('return string from string with offset', () => expect(dewIt(secret, 500)));
    it('return string from buffer with offset', () => expect(dewItBuffer(Buffer(secret, 500))));
});
