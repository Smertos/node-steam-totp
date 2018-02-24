const { expect } = require('chai');
const { describe, it } = require('mocha');
const { getDeviceID } = require('../index.js');
const regex =/^android:([0-9a-f]){8}-([0-9a-f]){4}-([0-9a-f]){4}-([0-9a-f]){4}-([0-9a-f]){12}$/;
const testID = '76561198019703813';

describe('getDeviceID', () => {
    it('shoud return compatable device ID when SteamID is a string',
      () => expect(getDeviceID(testID)).to.match(regex));
    it('shoud return compatable device ID when SteamID is an object with toString',
      () => expect(getDeviceID({ toString: () => testID  })).to.match(regex));
});
