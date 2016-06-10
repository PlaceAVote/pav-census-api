'use strict';
const expect = require('chai').expect;
const billController = require('../../../lib/controllers/bill.js');

const mockSampler = {
  population: () => {
    return 0;
  },
};

describe('Bill Controller', () => {
  describe('Has Functions', () => {
    it('getCensusData', () => {
      const subject = billController();
      expect(subject.getCensusData).to.be.a('function');
    });
  });
  describe('getCensusData', () => {
    it('returns 400 if bill id is not defined', () => {
      const subject = billController();
      const mockReq = {
        query: {},
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({ message: 'Invalid Request' });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      expect(mockRes.statusCode).to.eql(400);
    });

    it('returns 400 if state is not defined', () => {
      const subject = billController();
      const mockReq = {
        query: {
          billId: 'id',
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({ message: 'Invalid Request' });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      expect(mockRes.statusCode).to.eql(400);
    });

    it('returns 400 if district is not defined', () => {
      const subject = billController();
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({ message: 'Invalid Request' });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      expect(mockRes.statusCode).to.eql(400);
    });

    it('returns 400 if district is not an int', () => {
      const subject = billController();
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
          district: 'cantParseMe',
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({ message: 'Invalid Request' });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      expect(mockRes.statusCode).to.eql(400);
    });
    it('returns 500 if count data has failed', () => {
      const mockPopulationDataReader = {
        byDistrict: (query, callback) => {
          return callback();
        },
      };
      const mockCountDataReader = {
        byDistrict: (query, callback) => {
          callback(new Error('I cant count'));
        },
      };
      const mockGenderBreakdownReader = {
        getGenderBreakdownForAgeRanges: (params, callback) => {
          return callback();
        },
      };
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
      };
      const subject = billController({ populationDataReader: mockPopulationDataReader, countDataReader:
        mockCountDataReader, cache: mockCache, genderBreakdownReader: mockGenderBreakdownReader });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
          district: 6,
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({ message: 'An Internal Error Occurred' });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      expect(mockRes.statusCode).to.eql(500);
    });
    it('returns 500 if population data has failed', () => {
      const mockPopulationDataReader = {
        byDistrict: (query, callback) => {
          return callback(new Error('Population Error'));
        },
      };
      const mockCountDataReader = {
        byDistrict: (query, callback) => {
          callback();
        },
      };
      const mockGenderBreakdownReader = {
        getGenderBreakdownForAgeRanges: (params, callback) => {
          return callback();
        },
      };
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
      };
      const subject = billController({ populationDataReader: mockPopulationDataReader, countDataReader:
        mockCountDataReader, cache: mockCache, genderBreakdownReader: mockGenderBreakdownReader });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
          district: 6,
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({ message: 'An Internal Error Occurred' });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      expect(mockRes.statusCode).to.eql(500);
    });
    it('returns 500 if genderBreakdown has failed', () => {
      const mockPopulationDataReader = {
        byDistrict: (query, callback) => {
          return callback();
        },
      };
      const mockCountDataReader = {
        byDistrict: (query, callback) => {
          callback();
        },
      };
      const mockGenderBreakdownReader = {
        getGenderBreakdownForAgeRanges: (params, callback) => {
          return callback(new Error('Gender Breakdown Failure'));
        },
      };
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
      };
      const subject = billController({ populationDataReader: mockPopulationDataReader, countDataReader:
        mockCountDataReader, cache: mockCache, genderBreakdownReader: mockGenderBreakdownReader });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
          district: 6,
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({ message: 'An Internal Error Occurred' });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      expect(mockRes.statusCode).to.eql(500);
    });
    it('returns demographics in body when they\'re no errors', () => {
      let receivedPopQuery;
      const mockPopulationDataReader = {
        byDistrict: (query, callback) => {
          receivedPopQuery = query;
          return callback(null, 20);
        },
      };
      let receivedCountQuery;
      const mockCountDataReader = {
        byDistrict: (query, callback) => {
          receivedCountQuery = query;
          return callback(null, { yes: 100, no: 30, total: 130, male: 50, maleYes: 20, maleNo: 30, female: 70, femaleYes: 20, femaleNo: 50, nonBinary: 10, nonBinaryYes: 10, nonBinaryNo: 0 });
        },
      };
      let called = false;
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
        set: (params, cb) => {
          called = true;
          cb();
        },
      };
      const mockGenderBreakdownReader = {
        getGenderBreakdownForAgeRanges: (params, callback) => {
          return callback(null, { they: {} });
        },
      };
      const subject = billController({
        populationDataReader: mockPopulationDataReader,
        genderBreakdownReader: mockGenderBreakdownReader,
        countDataReader: mockCountDataReader,
        sampler: mockSampler,
        cache: mockCache,
      });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
          district: 6,
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({
            population: 20,
            sampleSize: 0,
            votes: {
              yes: 100,
              no: 30,
              total: 130,
            },
            gender: {
              male: {
                votes: {
                  yes: 20,
                  no: 30,
                  total: 50,
                },
              },
              female: {
                votes: {
                  yes: 20,
                  no: 50,
                  total: 70,
                },
              },
              nonBinary: {
                votes: {
                  yes: 10,
                  no: 0,
                  total: 10,
                },
              },
            },
          });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      expect(receivedPopQuery.state).to.eql('CA');
      expect(receivedPopQuery.billId).to.eql('id');
      expect(receivedPopQuery.district).to.eql(6);
      expect(receivedCountQuery.state).to.eql('CA');
      expect(receivedCountQuery.billId).to.eql('id');
      expect(receivedCountQuery.district).to.eql(6);
      expect(called).to.eql(true);
    });
    it('returns empty votes if null or undefined is returned from data reader', () => {
      const mockPopulationDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, 20);
        },
      };
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
        set: (params, cb) => {
          cb(null);
        },
      };
      const mockCountDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, null);
        },
      };
      const mockGenderBreakdownReader = {
        getGenderBreakdownForAgeRanges: (params, callback) => {
          return callback(null, { female: {} });
        },
      };
      const subject = billController({
        populationDataReader: mockPopulationDataReader,
        countDataReader: mockCountDataReader,
        genderBreakdownReader: mockGenderBreakdownReader,
        sampler: mockSampler,
        cache: mockCache,
      });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
          district: 6,
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({
            population: 20,
            sampleSize: 0,
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
            gender: {
              male: {
                votes: {
                  yes: 0,
                  no: 0,
                  total: 0,
                },
              },
              female: {
                votes: {
                  yes: 0,
                  no: 0,
                  total: 0,
                },
              },
              nonBinary: {
                votes: {
                  yes: 0,
                  no: 0,
                  total: 0,
                },
              },
            },
          });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
    });
    it('returns demographics in body when they\'re no errors', () => {
      const mockPopulationDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, 20);
        },
      };
      const mockCountDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, {});
        },
      };
      const mockGenderBreakdownReader = {
        getGenderBreakdownForAgeRanges: (params, callback) => {
          return callback(null, { male: {} });
        },
      };
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
        set: (params, cb) => {
          cb(null);
        },
      };
      const subject = billController({
        populationDataReader: mockPopulationDataReader,
        countDataReader: mockCountDataReader,
        genderBreakdownReader: mockGenderBreakdownReader,
        sampler: mockSampler,
        cache: mockCache,
      });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
          district: 6,
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({
            population: 20,
            sampleSize: 0,
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
            gender: {
              male: {
                votes: {
                  yes: 0,
                  no: 0,
                  total: 0,
                },
              },
              female: {
                votes: {
                  yes: 0,
                  no: 0,
                  total: 0,
                },
              },
              nonBinary: {
                votes: {
                  yes: 0,
                  no: 0,
                  total: 0,
                },
              },
            },
          });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
    });
    it('returns object from cache when an object is found', (done) => {
      const mockPopulationDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, 20);
        },
      };
      const mockCountDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, {});
        },
      };
      let expectedKey;
      const data = {
        population: 20,
        sampleSize: 0,
        votes: {
          yes: 0,
          no: 0,
          total: 0,
        },
        gender: {
          male: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
          },
          female: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
          },
          nonBinary: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
          },
        },
      };
      const mockCache = {
        get: (key, cb) => {
          expectedKey = key;
          cb(data);
        },
      };
      const subject = billController({
        populationDataReader: mockPopulationDataReader,
        countDataReader: mockCountDataReader,
        sampler: mockSampler,
        cache: mockCache,
      });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
          district: 6,
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql(data);
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      expect(expectedKey).to.eql('CA-id-6');
      done();
    });
    it('returns an object even if failing to write to the cache', (done) => {
      const mockPopulationDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, 20);
        },
      };
      const mockCountDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, {});
        },
      };
      const mockGenderBreakdownReader = {
        getGenderBreakdownForAgeRanges: (params, callback) => {
          return callback(null, {});
        },
      };
      const data = {
        population: 20,
        sampleSize: 0,
        votes: {
          yes: 0,
          no: 0,
          total: 0,
        },
        gender: {
          male: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
          },
          female: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
          },
          nonBinary: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
          },
        },
      };
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
        set: (params, cb) => {
          cb(new Error('Failed Writing to Cache'));
        },
      };
      const subject = billController({
        populationDataReader: mockPopulationDataReader,
        countDataReader: mockCountDataReader,
        sampler: mockSampler,
        cache: mockCache,
        genderBreakdownReader: mockGenderBreakdownReader,
      });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
          district: 6,
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql(data);
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      done();
    });
    it('passes cache correct params', (done) => {
      const mockPopulationDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, 20);
        },
      };
      const mockCountDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, {});
        },
      };
      const mockGenderBreakDown = {
        male: {
          ranges: [{ minAge: 30, maxAge: 40, votes: { total: 0, yes: 0, no: 0 } }],
        },
        female: {
          ranges: [{ minAge: 30, maxAge: 40, votes: { total: 0, yes: 0, no: 0 } }],
        },
        they: {
          ranges: [{ minAge: 30, maxAge: 40, votes: { total: 0, yes: 0, no: 0 } }],
        },
      };
      const mockGenderBreakdownReader = {
        getGenderBreakdownForAgeRanges: (params, callback) => {
          return callback(null, mockGenderBreakDown);
        },
      };
      const data = {
        population: 20,
        sampleSize: 0,
        votes: {
          yes: 0,
          no: 0,
          total: 0,
        },
        gender: {
          male: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
            ranges: [
              {
                minAge: 30,
                maxAge: 40,
                votes: {
                  total: 0,
                  yes: 0,
                  no: 0,
                },
              },
            ],
          },
          female: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
            ranges: [
              {
                minAge: 30,
                maxAge: 40,
                votes: {
                  total: 0,
                  yes: 0,
                  no: 0,
                },
              },
            ],
          },
          nonBinary: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
            ranges: [
              {
                minAge: 30,
                maxAge: 40,
                votes: {
                  total: 0,
                  yes: 0,
                  no: 0,
                },
              },
            ],
          },
        },
      };
      let cacheParams;
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
        set: (params, cb) => {
          cacheParams = params;
          cb(null);
        },
      };
      const subject = billController({
        populationDataReader: mockPopulationDataReader,
        countDataReader: mockCountDataReader,
        genderBreakdownReader: mockGenderBreakdownReader,
        sampler: mockSampler,
        cache: mockCache,
      });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
          district: 6,
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql(data);
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      expect(cacheParams.key).to.eql('CA-id-6');
      expect(cacheParams.body).to.eql(data);
      done();
    });
    it('calls gender reader with correct params', (done) => {
      const mockPopulationDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, 20);
        },
      };
      const mockCountDataReader = {
        byDistrict: (query, callback) => {
          return callback(null, {});
        },
      };
      const mockGenderBreakDown = {
        male: {
          ranges: [{ minAge: 30, maxAge: 40, votes: { total: 0, yes: 0, no: 0 } }],
        },
        female: {
          ranges: [{ minAge: 30, maxAge: 40, votes: { total: 0, yes: 0, no: 0 } }],
        },
        they: {
          ranges: [{ minAge: 30, maxAge: 40, votes: { total: 0, yes: 0, no: 0 } }],
        },
      };
      let calledGenderParams;
      const mockGenderBreakdownReader = {
        getGenderBreakdownForAgeRanges: (params, callback) => {
          calledGenderParams = params;
          return callback(null, mockGenderBreakDown);
        },
      };
      const data = {
        population: 20,
        sampleSize: 0,
        votes: {
          yes: 0,
          no: 0,
          total: 0,
        },
        gender: {
          male: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
            ranges: [
              {
                minAge: 30,
                maxAge: 40,
                votes: {
                  total: 0,
                  yes: 0,
                  no: 0,
                },
              },
            ],
          },
          female: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
            ranges: [
              {
                minAge: 30,
                maxAge: 40,
                votes: {
                  total: 0,
                  yes: 0,
                  no: 0,
                },
              },
            ],
          },
          nonBinary: {
            votes: {
              yes: 0,
              no: 0,
              total: 0,
            },
            ranges: [
              {
                minAge: 30,
                maxAge: 40,
                votes: {
                  total: 0,
                  yes: 0,
                  no: 0,
                },
              },
            ],
          },
        },
      };
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
        set: (params, cb) => {
          cb(null);
        },
      };
      const subject = billController({
        populationDataReader: mockPopulationDataReader,
        countDataReader: mockCountDataReader,
        genderBreakdownReader: mockGenderBreakdownReader,
        sampler: mockSampler,
        cache: mockCache,
      });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'CA',
          district: 6,
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql(data);
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
      expect(calledGenderParams.billId).to.eql('id');
      expect(calledGenderParams.state).to.eql('CA');
      expect(calledGenderParams.district).to.eql(6);
      expect(calledGenderParams.ranges).to.eql([
        {
          min: 18,
          max: 30,
        },
        {
          min: 30,
          max: 45,
        },
        {
          min: 45,
          max: 60,
        },
        {
          min: 60,
          max: 120,
        },
      ]);
      done();
    });
  });
});
