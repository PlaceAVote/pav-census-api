'use strict';
const expect = require('chai').expect;
const gender = require('../../../lib/data/gender.js');

describe('Gender', () => {
  describe('Has functions', () => {
    it('maleByStateAndDistrict', () => {
      const subject = gender();
      expect(subject.maleByStateAndDistrict).to.be.a('function');
    });
    it('femaleByStateAndDistrict', () => {
      const subject = gender();
      expect(subject.femaleByStateAndDistrict).to.be.a('function');
    });
  });
  describe('maleByStateAndDistrict', () => {
    it('returns null if state is not defined', (done) => {
      const subject = gender();
      subject.maleByStateAndDistrict({ state: undefined, district: '6' }, (err, result) => {
        expect(err.message).to.eql('No State Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    it('returns null if district is not defined', (done) => {
      const subject = gender();
      subject.maleByStateAndDistrict({ state: 'CA', district: undefined }, (err, result) => {
        expect(err.message).to.eql('No District Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    it('returns null if billId is not defined', (done) => {
      const subject = gender();
      subject.maleByStateAndDistrict({ state: 'CA', district: 6, billId: undefined }, (err, result) => {
        expect(err.message).to.eql('No Bill ID Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    xit('calls connection with correct params', (done) => {
      let query;
      const connection = {
        query: (select, callback) => {
          query = select;
          return callback();
        },
      };
      const subject = gender({ connection: connection, table: 'census_data' });
      subject.maleByStateAndDistrict({ state: 'CA', district: 6 }, (err) => {
        expect(err).to.eql(null);
        expect(query).to.eql('');
        done();
      });
    });
  });

  describe('femaleByStateAndDistrict', () => {
    it('returns null if state is not defined', (done) => {
      const subject = gender();
      subject.femaleByStateAndDistrict({ state: undefined, district: '6' }, (err, result) => {
        expect(err.message).to.eql('No State Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    it('returns null if district is not defined', (done) => {
      const subject = gender();
      subject.femaleByStateAndDistrict({ state: 'CA', district: undefined }, (err, result) => {
        expect(err.message).to.eql('No District Defined');
        expect(result).to.eql(null);
        done();
      });
    });
  });
});
