'use strict';
const expect = require('chai').expect;
const population = require('../../../lib/data/population.js');

describe('Population', () => {
  describe('Has functions', () => {
    it('byDistrict', () => {
      const subject = population();
      expect(subject.byDistrict).to.be.a('function');
    });
  });
  describe('byDistrict', () => {
    it('returns null if state not defined', (done) => {
      const subject = population();
      subject.byDistrict({ state: undefined, district: '6' }, (err, result) => {
        expect(err.message).to.eql('No State Defined');
        expect(result).to.eql(null);
        done();
      });
    });
    it('returns null if district not defined', (done) => {
      const subject = population();
      subject.byDistrict({ state: 'CA', district: undefined }, (err, result) => {
        expect(err.message).to.eql('No District Defined');
        expect(result).to.eql(null);
        done();
      });
    });
    it('calls connection with correct params', (done) => {
      let string;
      const connection = {
        query: (select, callback) => {
          string = select;
          return callback();
        },
      };
      const subject = population({ connection: connection, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6 }, (err) => {
        expect(err).to.eql(null);
        expect(string).to.eql('SELECT SUM(population) FROM census_data WHERE state = \'CA\' AND district = 6');
        done();
      });
    });
    it('returns an error from sql in the outer callback', (done) => {
      const connection = {
        query: (select, callback) => {
          return callback(new Error('SQL ERROR'));
        },
      };
      const subject = population({ connection: connection, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6 }, (err, result) => {
        expect(err.message).to.eql('SQL ERROR');
        expect(result).to.eql(null);
        done();
      });
    });
    it('Returns the sum of the population', (done) => {
      const connection = {
        query: (select, callback) => {
          return callback(null, [{ 'SUM(population)': 1050254 }]);
        },
      };
      const subject = population({ connection: connection, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6 }, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql(1050254);
        done();
      });
    });
    it('Returns 0 if no results are found', (done) => {
      const connection = {
        query: (select, callback) => {
          return callback(null, []);
        },
      };
      const subject = population({ connection: connection, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6 }, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql(0);
        done();
      });
    });
    it('Returns 0 if results are found but no sum property is available', (done) => {
      const connection = {
        query: (select, callback) => {
          return callback(null, [{}]);
        },
      };
      const subject = population({ connection: connection, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6 }, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql(0);
        done();
      });
    });
  });
});
