'use strict';
const expect = require('chai').expect;
const gender = require('../../../lib/data/gender.js');
const defaults = require('../../../defaults/defaults.js');

describe('Gender', () => {
  describe('Has functions', () => {
    xit('getGenderBreakdownByAge', () => {
      const subject = gender();
      expect(subject.getGenderBreakdownByAge).to.be.a('function');
    });
    it('byMultipleAgeRanges', () => {
      const subject = gender();
      expect(subject.byMultipleAgeRanges).to.be.a('function');
    });
  });
  describe('maleByStateAndDistrict', () => {
    xit('test', (done) => {
      const connection = {
        host: process.env.CONNECTION_HOST,
        user: process.env.CONNECTION_USER,
        password: process.env.CONNECTION_PASSWORD,
        database: process.env.CONNECTION_DB,
        connectionLimit: 100,
      };
      const pool = defaults.pool(connection);
      const gen = gender({
        pool: pool,
        census: 'census_data',
        userInfo: 'user_info',
        userVotes: 'user_votes',
      });
      const params = {
        state: 'CA',
        district: 33,
        billId: 'hr2-214',
      };
      gen.byMultipleAgeRanges(params, 'M', () => {
        done();
      });
    });
  });
});
