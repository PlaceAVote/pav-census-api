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
    it('returns null is state not defined', (done) => {
      const subject = population();
      subject.byDistrict(undefined, '6', (err, result) => {
        expect(err.message).to.eql('No State Defined');
        expect(result).to.eql(null);
        done();
      });
    });
    it('returns null is district not defined', (done) => {
      const subject = population();
      subject.byDistrict('California', undefined, (err, result) => {
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
      subject.byDistrict('California', 6, (err) => {
        expect(err).to.eql(null);
        expect(string).to.eql('SELECT population FROM census_data WHERE state = \'California\' AND district = 6');
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
      subject.byDistrict('California', 6, (err, result) => {
        expect(err.message).to.eql('SQL ERROR');
        expect(result).to.eql(null);
        done();
      });
    });
    it('returns the sum of population from each row', (done) => {
      const connection = {
        query: (select, callback) => {
          return callback(null, [{ population: 10 }, { population: 20 }]);
        },
      };
      const subject = population({ connection: connection, table: 'census_data' });
      subject.byDistrict('California', 6, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql(30);
        done();
      });
    });
  });
});
