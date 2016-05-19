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

    it('calls connection with correct params', (done) => {
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
        expect(query).to.eql('SELECT COUNT(vote) SELECT dob FROM undefined INNER JOIN undefined ON user_id WHERE state = \'CA\' AND district = 6 AND gender = \'M\'');
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

    it('calls connection with correct params', (done) => {
      let query;
      const connection = {
        query: (select, callback) => {
          query = select;
          return callback();
        },
      };
      const subject = gender({ connection: connection, table: 'census_data' });
      subject.femaleByStateAndDistrict({ state: 'CA', district: 6 }, (err) => {
        expect(err).to.eql(null);
        expect(query).to.eql('SELECT COUNT(vote) SELECT dob FROM undefined INNER JOIN undefined ON user_id WHERE state = \'CA\' AND district = 6 AND gender = \'F\'');
        done();
      });
    });
  });
});
