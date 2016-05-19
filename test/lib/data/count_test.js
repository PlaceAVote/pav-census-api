'use strict';
const expect = require('chai').expect;
const count = require('../../../lib/data/count.js');
const defaults = require('../../../lib/config/defaults.js');

describe('Count', () => {
  describe('Has functions', () => {
    it('byDistrict', () => {
      const subject = count();
      expect(subject.byDistrict).to.be.a('function');
    });
  });

  describe('byDistrict', () => {
    it('returns null if state not defined', (done) => {
      const subject = count();
      subject.byDistrict({ state: undefined, district: '6' }, (err, result) => {
        expect(err.message).to.eql('No State Defined');
        expect(result).to.eql(null);
        done();
      });
    });
    it('returns null if district not defined', (done) => {
      const subject = count();
      subject.byDistrict({ state: 'CA', district: undefined }, (err, result) => {
        expect(err.message).to.eql('No District Defined');
        expect(result).to.eql(null);
        done();
      });
    });
    it('returns null if bill not defined', (done) => {
      const subject = count();
      subject.byDistrict({ state: 'CA', district: 6, billId: undefined }, (err, result) => {
        expect(err.message).to.eql('No Bill ID Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    it('calls connection with correct params', (done) => {
      let string;
      const connection = {
        query: (select, callback) => {
          string = select;
          return callback(null);
        },
      };
      const subject = count({ connection: connection, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6, billId: 'hr2014-12' }, (err) => {
        expect(err).to.eql(null);
        expect(string).to.eql('SELECT vote FROM undefined INNER JOIN undefined ON undefined.user_id WHERE state = \'CA\' AND district = 6 AND bill_id = \'hr2014-12\'');
        done();
      });
    });
    xit('live', (done) => {
      const options = {
        votes: 'user_votes',
        info: 'user_info',
        connection: defaults.user(),
      };
      const subject = count(options);
      subject.byDistrict({ state: 'CA', district: 5, billId: 'hr2600-114' }, (err) => {
        if (err) {
          // console.log('ERROR', err);
        } else {
          // console.log('RESULT', res);
        }
        done();
      });
    });
    it('returns an error from sql in the outer callback', (done) => {
      const connection = {
        query: (select, callback) => {
          return callback(new Error('SQL ERROR'));
        },
      };
      const subject = count({ connection: connection, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6, billId: 'billId' }, (err, result) => {
        expect(err.message).to.eql('SQL ERROR');
        expect(result).to.eql(null);
        done();
      });
    });

    it('returns the count of votes in a hash of yes no as zero when theres no results', (done) => {
      const connection = {
        query: (select, callback) => {
          return callback(null, []);
        },
      };
      const subject = count({ connection: connection, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6, billId: 'billId' }, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql({ yes: 0, no: 0, total: 0 });
        done();
      });
    });
  });
});
