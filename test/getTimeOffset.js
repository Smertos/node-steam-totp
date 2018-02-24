const { expect } = require('chai');
const { describe, it } = require('mocha');
const { getTimeOffset } = require('../index.js');

describe('getTimeOffset', () => {
    it('resolves', () => getTimeOffset());
    it('returns tuple of 2 numbers',
        () => getTimeOffset().then(
            tuple => {
                expect(tuple).to.not.be.an('undefined');
                expect(tuple).to.be.an('array');
                expect(tuple).to.have.lengthOf(2);

                const [offset, diff] = tuple;

                expect(offset).to.be.a('number');
                expect(offset).to.be.finite;
                expect(diff).to.be.a('number');
                expect(diff).to.be.finite;
            }
        )
    );
    it('it correctly calculates request time',
        () => {
            const start = Date.now();
            return getTimeOffset().then(
                tuple => {
                    const diff = Math.floor(tuple[1] / 1000);
                    const ourDiff = Math.floor(Date.now() / 1000) - Math.floor(start / 1000);

                    expect(diff).to.be.closeTo(ourDiff, 1); // we expect maximum diff between our and fn's calculation to be around 1 sec
                }    
            );
        }
    );
});
