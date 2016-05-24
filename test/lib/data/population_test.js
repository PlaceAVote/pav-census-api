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
      let prepared;
      const pool = {
        getConnection: (cb) => {
          const connection = {
            execute: (statement, preparedParams, ecb) => {
              string = statement;
              prepared = preparedParams;
              ecb(null);
            },
            release: () => {},
          };
          cb(null, connection);
        },
      };
      const subject = population({ pool: pool, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6 }, (err) => {
        expect(err).to.eql(null);
        expect(string).to.eql('SELECT SUM(population) FROM census_data WHERE state = ? AND district = ?');
        expect(prepared.length).to.eql(2);
        expect(prepared[0]).to.eql('CA');
        expect(prepared[1]).to.eql(6);
        done();
      });
    });

    it('returns an error from sql in the outer callback', (done) => {
      const pool = {
        getConnection: (cb) => {
          const connection = {
            execute: (statement, preparedParams, ecb) => {
              ecb(new Error('SQL ERROR'));
            },
            release: () => {},
          };
          cb(null, connection);
        },
      };
      const subject = population({ pool: pool, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6 }, (err, result) => {
        expect(err.message).to.eql('SQL ERROR');
        expect(result).to.eql(null);
        done();
      });
    });

    it('Returns the sum of the population', (done) => {
      const pool = {
        getConnection: (cb) => {
          const connection = {
            execute: (statement, preparedParams, ecb) => {
              ecb(null, [{ 'SUM(population)': 1050254 }]);
            },
            release: () => {},
          };
          cb(null, connection);
        },
      };
      const subject = population({ pool: pool, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6 }, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql(1050254);
        done();
      });
    });

    it('Returns 0 if no results are found', (done) => {
      const pool = {
        getConnection: (cb) => {
          const connection = {
            execute: (statement, preparedParams, ecb) => {
              ecb(null, []);
            },
            release: () => {},
          };
          cb(null, connection);
        },
      };
      const subject = population({ pool: pool, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6 }, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql(0);
        done();
      });
    });

    it('Returns 0 if results are found but no sum property is available', (done) => {
      const pool = {
        getConnection: (cb) => {
          const connection = {
            execute: (statement, preparedParams, ecb) => {
              ecb(null, [{}]);
            },
            release: () => {},
          };
          cb(null, connection);
        },
      };
      const subject = population({ pool: pool, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6 }, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql(0);
        done();
      });
    });

    it('Returns an error when no connection returned from pool', (done) => {
      const pool = {
        getConnection: (cb) => {
          cb(new Error('Connection Pool Error'));
        },
      };
      const subject = population({ pool: pool, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6 }, (err) => {
        expect(err.message).to.eql('Connection Pool Error');
        done();
      });
    });
  });
});
