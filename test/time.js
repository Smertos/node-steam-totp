const { expect } = require('chai');
const { describe, it } = require('mocha');
const { time } = require('../index.js');

describe('time', () => {
    it('shoud return number (no arg)',
        () => expect(time()).to.be.a('number'));
    it('shoud return number (with arg)',
        () => expect(time(500)).to.be.a('number'));
    it('should work as expected',
        () => expect(Math.floor(Date.now() / 1000) + 500).to.equal(time(500)));
});
