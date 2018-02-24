const { expect } = require('chai');
const { describe, it } = require('mocha');
const { generateConfirmationKey } = require('../index.js');

describe('generateConfirmationKey', () => {
    ['conf', 'details', 'allow', 'cancel']
        .forEach(tag => {
            const dewIt = iSecret => generateConfirmationKey(iSecret, Math.floor(Date.now() / 1000), tag);

            it(`returns string from string (tag: ${tag})`, () => expect(dewIt(tag.repeat(8))).to.be.a('string'));
            it(`returns string from buffer (tag: ${tag})`, () => expect(dewIt(Buffer(tag.repeat(8)))).to.be.a('string'));
        });
});
