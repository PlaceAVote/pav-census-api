'use strict';
const expect = require('chai').expect;
const gender = require('../../../lib/data/gender.js');
const defaults = require('../../../defaults/defaults.js');

describe('Gender', () => {
  describe('Has functions', () => {
    it('getGenderBreakdownForAgeRange', () => {
      const subject = gender();
      expect(subject.getGenderBreakdownForAgeRange).to.be.a('function');
    });
    it('getGenderBreakdownForAgeRanges', () => {
      const subject = gender();
      expect(subject.getGenderBreakdownForAgeRanges).to.be.a('function');
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
        info: 'user_info',
        votes: 'user_votes',
      });
      const params = {
        state: 'CA',
        district: 33,
        billId: 's2517-114',
        range: {
          min: 10,
          max: 60,
        },
      };
      gen.getGenderBreakdownForAgeRange(params, () => {
        done();
      });
    });
  });
  describe('GetForGenderAndAgeRangeAndStateDistrict', () => {
    it('returns error when state isnt defined', (done) => {
      const gen = gender();
      const params = {
        district: 33,
        billId: 'hr2-214',
        gender: 'Male',
        range: {
          min: 9,
          max: 11,
        },
      };
      gen.getGenderBreakdownForAgeRange(params, (err) => {
        expect(err.message).to.eql('Must specify state in params');
        done();
      });
    });
    it('returns error when district isnt defined', (done) => {
      const gen = gender();
      const params = {
        state: 'CA',
        billId: 'hr2-214',
        gender: 'Male',
        range: {
          min: 9,
          max: 11,
        },
      };
      gen.getGenderBreakdownForAgeRange(params, (err) => {
        expect(err.message).to.eql('Must specify district in params');
        done();
      });
    });
    it('returns error when billId isnt defined', (done) => {
      const gen = gender();
      const params = {
        state: 'CA',
        district: 4,
        gender: 'Male',
        range: {
          min: 9,
          max: 11,
        },
      };
      gen.getGenderBreakdownForAgeRange(params, (err) => {
        expect(err.message).to.eql('Must specify bill Id in params');
        done();
      });
    });
    it('returns error when range isnt defined', (done) => {
      const gen = gender();
      const params = {
        state: 'CA',
        district: 4,
        billId: 'billh42-102',
        gender: 'Male',
      };
      gen.getGenderBreakdownForAgeRange(params, (err) => {
        expect(err.message).to.eql('Must specify range in params');
        done();
      });
    });
    it('returns error when range.min isnt defined', (done) => {
      const gen = gender();
      const params = {
        state: 'CA',
        district: 4,
        billId: 'billh42-102',
        gender: 'Male',
        range: {
          max: 20,
        },
      };
      gen.getGenderBreakdownForAgeRange(params, (err) => {
        expect(err.message).to.eql('Must specify range in params');
        done();
      });
    });
    it('returns error when range.max isnt defined', (done) => {
      const gen = gender();
      const params = {
        state: 'CA',
        district: 4,
        billId: 'billh42-102',
        gender: 'Male',
        range: {
          min: 20,
        },
      };
      gen.getGenderBreakdownForAgeRange(params, (err) => {
        expect(err.message).to.eql('Must specify range in params');
        done();
      });
    });
    it('returns an error when no params are defined', (done) => {
      const gen = gender();
      gen.getGenderBreakdownForAgeRange(null, (err) => {
        expect(err.message).to.eql('Must provide params');
        done();
      });
    });
    it('calls connection with correct params', (done) => {
      let calledStatement;
      let calledPreparedParams;
      let released = false;
      const connection = {
        execute: (statement, preparedParams, cb) => {
          calledStatement = statement;
          calledPreparedParams = preparedParams;
          cb(null, []);
        },
        release: () => { released = true; },
      };
      const pool = {
        getConnection: (cb) => { cb(null, connection); },
      };
      const options = {
        pool: pool,
        census: 'census_data',
        info: 'user_info',
        votes: 'user_votes',
      };
      const params = {
        state: 'CA',
        district: 4,
        billId: 'billh42-102',
        gender: 'Male',
        range: {
          min: 20,
          max: 40,
        },
      };
      const expectedStatement =
    `SELECT gender,
    CASE WHEN vote = 1 THEN 'yes'
    WHEN vote = 0 THEN 'no'
    ELSE '<unknown>'
    END as votes,
    COUNT(vote) FROM (
    SELECT vote, gender,
    TIMESTAMPDIFF(YEAR, FROM_UNIXTIME(dob/1000), CURDATE()) AS 'age'
    FROM ${options.info} AS u
    JOIN ${options.votes} AS v ON u.user_id = v.user_id
    WHERE u.state = ? AND u.district = ? AND v.bill_id = ?
    HAVING age >= ${params.range.min} AND age <= ${params.range.max}
    ) AS T GROUP BY gender, votes;`;
      const subject = gender(options);
      subject.getGenderBreakdownForAgeRange(params, () => {
        expect(calledStatement).to.eql(expectedStatement);
        expect(calledPreparedParams.length).to.eql(3);
        expect(calledPreparedParams[0]).to.eql('CA');
        expect(calledPreparedParams[1]).to.eql(4);
        expect(calledPreparedParams[2]).to.eql('billh42-102');
        expect(released).to.eql(true);
        done();
      });
    });
    it('calls connection with correct params', (done) => {
      const pool = {
        getConnection: (cb) => { cb(new Error('Error fail')); },
      };
      const options = {
        pool: pool,
        info: 'user_info',
        votes: 'user_votes',
      };
      const params = {
        state: 'CA',
        district: 4,
        billId: 'billh42-102',
        gender: 'Male',
        range: {
          min: 20,
          max: 40,
        },
      };
      const subject = gender(options);
      subject.getGenderBreakdownForAgeRange(params, (err) => {
        expect(err.message).to.eql('Error fail');
        done();
      });
    });
    it('returns values from the datastore', (done) => {
      const connection = {
        execute: (statement, preparedParams, cb) => {
          cb(null, [
            {
              gender: 'male',
              votes: 'yes',
              'COUNT(vote)': 5,
            },
            {
              gender: 'male',
              votes: 'no',
              'COUNT(vote)': 2,
            },
            {
              gender: 'female',
              votes: 'yes',
              'COUNT(vote)': 3,
            },
            {
              gender: 'they',
              votes: 'no',
              'COUNT(vote)': 2,
            },
          ]);
        },
        release: () => {},
      };
      const pool = {
        getConnection: (cb) => { cb(null, connection); },
      };
      const options = {
        pool: pool,
        census: 'census_data',
        info: 'user_info',
        votes: 'user_votes',
      };
      const params = {
        state: 'CA',
        district: 4,
        billId: 'billh42-102',
        gender: 'Male',
        range: {
          min: 20,
          max: 40,
        },
      };
      const subject = gender(options);
      subject.getGenderBreakdownForAgeRange(params, (err, result) => {
        expect(err).to.eql(null);
        expect(result.male.total).to.eql(7);
        expect(result.male.yes).to.eql(5);
        expect(result.male.no).to.eql(2);
        expect(result.female.total).to.eql(3);
        expect(result.female.no).to.eql(0);
        expect(result.female.yes).to.eql(3);
        expect(result.they.total).to.eql(2);
        expect(result.they.yes).to.eql(0);
        expect(result.they.no).to.eql(2);
        done();
      });
    });
    it('returns values from the datastore when an empty result is returned', (done) => {
      const connection = {
        execute: (statement, preparedParams, cb) => {
          cb(null, []);
        },
        release: () => {},
      };
      const pool = {
        getConnection: (cb) => { cb(null, connection); },
      };
      const options = {
        pool: pool,
        census: 'census_data',
        info: 'user_info',
        votes: 'user_votes',
      };
      const params = {
        state: 'CA',
        district: 4,
        billId: 'billh42-102',
        gender: 'Male',
        range: {
          min: 20,
          max: 40,
        },
      };
      const subject = gender(options);
      subject.getGenderBreakdownForAgeRange(params, (err, result) => {
        expect(err).to.eql(null);
        expect(result.male.total).to.eql(0);
        expect(result.male.yes).to.eql(0);
        expect(result.male.no).to.eql(0);
        expect(result.female.total).to.eql(0);
        expect(result.female.no).to.eql(0);
        expect(result.female.yes).to.eql(0);
        expect(result.they.total).to.eql(0);
        expect(result.they.yes).to.eql(0);
        expect(result.they.no).to.eql(0);
        done();
      });
    });
    it('returns a default row when an undefined result is returned', (done) => {
      const connection = {
        execute: (statement, preparedParams, cb) => {
          cb(null, null);
        },
        release: () => {},
      };
      const pool = {
        getConnection: (cb) => { cb(null, connection); },
      };
      const options = {
        pool: pool,
        census: 'census_data',
        info: 'user_info',
        votes: 'user_votes',
      };
      const params = {
        state: 'CA',
        district: 4,
        billId: 'billh42-102',
        gender: 'Male',
        range: {
          min: 20,
          max: 40,
        },
      };
      const subject = gender(options);
      subject.getGenderBreakdownForAgeRange(params, (err, result) => {
        expect(err).to.eql(null);
        expect(result.male.total).to.eql(0);
        expect(result.male.yes).to.eql(0);
        expect(result.male.no).to.eql(0);
        expect(result.female.total).to.eql(0);
        expect(result.female.no).to.eql(0);
        expect(result.female.yes).to.eql(0);
        expect(result.they.total).to.eql(0);
        expect(result.they.yes).to.eql(0);
        expect(result.they.no).to.eql(0);
        done();
      });
    });
    it('returns a default row when an error occurs', (done) => {
      const connection = {
        execute: (statement, preparedParams, cb) => {
          cb(new Error('Error'), null);
        },
        release: () => {},
      };
      const pool = {
        getConnection: (cb) => { cb(null, connection); },
      };
      const options = {
        pool: pool,
        census: 'census_data',
        info: 'user_info',
        votes: 'user_votes',
      };
      const params = {
        state: 'CA',
        district: 4,
        billId: 'billh42-102',
        gender: 'Male',
        range: {
          min: 20,
          max: 40,
        },
      };
      const subject = gender(options);
      subject.getGenderBreakdownForAgeRange(params, (err, result) => {
        expect(err).to.eql(null);
        expect(result.male.total).to.eql(0);
        expect(result.male.yes).to.eql(0);
        expect(result.male.no).to.eql(0);
        expect(result.female.total).to.eql(0);
        expect(result.female.no).to.eql(0);
        expect(result.female.yes).to.eql(0);
        expect(result.they.total).to.eql(0);
        expect(result.they.yes).to.eql(0);
        expect(result.they.no).to.eql(0);
        done();
      });
    });
  });
  describe('getGenderBreakdownForAgeRanges', () => {
    it('returns error when state isnt defined', (done) => {
      const gen = gender();
      const params = {
        district: 33,
        billId: 'hr2-214',
        gender: 'Male',
        range: {
          min: 9,
          max: 11,
        },
      };
      gen.getGenderBreakdownForAgeRanges(params, (err) => {
        expect(err.message).to.eql('Must specify state in params');
        done();
      });
    });
    it('returns error when district isnt defined', (done) => {
      const gen = gender();
      const params = {
        state: 'CA',
        billId: 'hr2-214',
        gender: 'Male',
        range: {
          min: 9,
          max: 11,
        },
      };
      gen.getGenderBreakdownForAgeRanges(params, (err) => {
        expect(err.message).to.eql('Must specify district in params');
        done();
      });
    });
    it('returns error when billId isnt defined', (done) => {
      const gen = gender();
      const params = {
        state: 'CA',
        district: 4,
        gender: 'Male',
        ranges: [{
          min: 9,
          max: 11,
        }],
      };
      gen.getGenderBreakdownForAgeRanges(params, (err) => {
        expect(err.message).to.eql('Must specify bill Id in params');
        done();
      });
    });
    it('returns error when ranges isnt defined', (done) => {
      const gen = gender();
      const params = {
        state: 'CA',
        district: 4,
        billId: 'billh42-102',
        gender: 'Male',
      };
      gen.getGenderBreakdownForAgeRanges(params, (err) => {
        expect(err.message).to.eql('Must specify ranges in params');
        done();
      });
    });
    it('returns an error when no params are defined', (done) => {
      const gen = gender();
      gen.getGenderBreakdownForAgeRanges(null, (err) => {
        expect(err.message).to.eql('Must provide params');
        done();
      });
    });
    it('should call getGenderBreakdownByAge 5 times for 5 ranges', (done) => {
      const params = {
        state: 'CA',
        district: 4,
        gender: 'Male',
        billId: 'billId-2j3',
        ranges: [
          {
            min: 1,
            max: 5,
          },
          {
            min: 5,
            max: 10,
          },
          {
            min: 10,
            max: 11,
          },
          {
            min: 11,
            max: 14,
          },
          {
            min: 14,
            max: 15,
          },
        ],
      };
      const calledParams = [];
      const connection = {
        execute: (statement, preparedParams, cb) => {
          calledParams.push(statement);
          cb(null, []);
        },
        release: () => {},
      };
      const pool = {
        getConnection: (cb) => { cb(null, connection); },
      };
      const options = {
        pool: pool,
        info: 'user_info',
        votes: 'user_votes',
      };
      const subject = gender(options);
      subject.getGenderBreakdownForAgeRanges(params, (err, result) => {
        expect(calledParams.length).to.eql(5);
        expect(calledParams[0]).to.contain('HAVING age >= 1 AND age <= 5');
        expect(calledParams[1]).to.contain('HAVING age >= 5 AND age <= 10');
        expect(calledParams[2]).to.contain('HAVING age >= 10 AND age <= 11');
        expect(calledParams[3]).to.contain('HAVING age >= 11 AND age <= 14');
        expect(calledParams[4]).to.contain('HAVING age >= 14 AND age <= 15');
        expect(result.male.ranges.length).to.eql(5);
        expect(result.male.ranges[0].minAge).to.eql(1);
        expect(result.male.ranges[0].maxAge).to.eql(5);
        expect(result.male.ranges[0].votes.yes).to.eql(0);
        expect(result.male.ranges[0].votes.no).to.eql(0);
        expect(result.male.ranges[0].votes.total).to.eql(0);
        expect(result.male.ranges[1].minAge).to.eql(5);
        expect(result.male.ranges[1].maxAge).to.eql(10);
        expect(result.male.ranges[1].votes.yes).to.eql(0);
        expect(result.male.ranges[1].votes.no).to.eql(0);
        expect(result.male.ranges[1].votes.total).to.eql(0);
        expect(result.female.ranges[0].minAge).to.eql(1);
        expect(result.female.ranges[0].minAge).to.eql(1);
        expect(result.female.ranges[0].maxAge).to.eql(5);
        expect(result.female.ranges[0].votes.yes).to.eql(0);
        expect(result.female.ranges[0].votes.no).to.eql(0);
        expect(result.female.ranges[0].votes.total).to.eql(0);
        expect(result.female.ranges[1].minAge).to.eql(5);
        expect(result.female.ranges[1].maxAge).to.eql(10);
        expect(result.female.ranges[1].votes.yes).to.eql(0);
        expect(result.female.ranges[1].votes.no).to.eql(0);
        expect(result.female.ranges[1].votes.total).to.eql(0);
        expect(result.female.ranges[0].maxAge).to.eql(5);
        expect(result.female.ranges[0].votes.yes).to.eql(0);
        expect(result.female.ranges[0].votes.no).to.eql(0);
        expect(result.female.ranges[0].votes.total).to.eql(0);
        expect(result.female.ranges[1].minAge).to.eql(5);
        expect(result.female.ranges[1].maxAge).to.eql(10);
        expect(result.female.ranges[1].votes.yes).to.eql(0);
        expect(result.female.ranges[1].votes.no).to.eql(0);
        expect(result.female.ranges[1].votes.total).to.eql(0);
        expect(result.they.ranges[0].minAge).to.eql(1);
        expect(result.they.ranges[0].minAge).to.eql(1);
        expect(result.they.ranges[0].maxAge).to.eql(5);
        expect(result.they.ranges[0].votes.yes).to.eql(0);
        expect(result.they.ranges[0].votes.no).to.eql(0);
        expect(result.they.ranges[0].votes.total).to.eql(0);
        expect(result.they.ranges[1].minAge).to.eql(5);
        expect(result.they.ranges[1].maxAge).to.eql(10);
        expect(result.they.ranges[1].votes.yes).to.eql(0);
        expect(result.they.ranges[1].votes.no).to.eql(0);
        expect(result.they.ranges[1].votes.total).to.eql(0);
        expect(result.they.ranges[0].maxAge).to.eql(5);
        expect(result.they.ranges[0].votes.yes).to.eql(0);
        expect(result.they.ranges[0].votes.no).to.eql(0);
        expect(result.they.ranges[0].votes.total).to.eql(0);
        expect(result.they.ranges[1].minAge).to.eql(5);
        expect(result.they.ranges[1].maxAge).to.eql(10);
        expect(result.they.ranges[1].votes.yes).to.eql(0);
        expect(result.they.ranges[1].votes.no).to.eql(0);
        expect(result.they.ranges[1].votes.total).to.eql(0);
        expect(result.female.ranges.length).to.eql(5);
        expect(result.they.ranges.length).to.eql(5);
        done();
      });
    });
    it('returns an error from the database should not bubble up and not break construction of stats', (done) => {
      const params = {
        state: 'CA',
        district: 4,
        gender: 'Male',
        billId: 'billId-2j3',
        ranges: [
          {
            min: 1,
            max: 5,
          },
        ],
      };
      const connection = {
        execute: (statement, preparedParams, cb) => {
          cb(new Error('OH OH'), null);
        },
        release: () => {},
      };
      const pool = {
        getConnection: (cb) => { cb(null, connection); },
      };
      const options = {
        pool: pool,
        info: 'user_info',
        votes: 'user_votes',
      };
      const subject = gender(options);
      subject.getGenderBreakdownForAgeRanges(params, (err, result) => {
        expect(err).to.eql(null);
        expect(result.male.ranges.length).to.eql(1);
        expect(result.female.ranges.length).to.eql(1);
        expect(result.they.ranges.length).to.eql(1);
        done();
      });
    });
    it('returns an error from the database should not bubble up and not break construction of stats', (done) => {
      const params = {
        state: 'CA',
        district: 4,
        gender: 'Male',
        billId: 'billId-2j3',
        ranges: [
          {
            min: 1,
          },
        ],
      };
      const connection = {
        execute: (statement, preparedParams, cb) => {
          cb(new Error('OH OH'), null);
        },
        release: () => {},
      };
      const pool = {
        getConnection: (cb) => { cb(null, connection); },
      };
      const options = {
        pool: pool,
        info: 'user_info',
        votes: 'user_votes',
      };
      const subject = gender(options);
      subject.getGenderBreakdownForAgeRanges(params, (err, result) => {
        expect(err).to.eql(null);
        expect(result.male.ranges.length).to.eql(1);
        expect(result.male.ranges[0].minAge).to.eql(0);
        expect(result.male.ranges[0].maxAge).to.eql(0);
        expect(result.male.ranges[0].votes.total).to.eql(0);
        expect(result.male.ranges[0].votes.yes).to.eql(0);
        expect(result.male.ranges[0].votes.no).to.eql(0);
        expect(result.male.ranges.length).to.eql(1);
        expect(result.female.ranges.length).to.eql(1);
        expect(result.they.ranges.length).to.eql(1);
        done();
      });
    });
  });
});
