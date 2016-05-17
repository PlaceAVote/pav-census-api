/* eslint-disable */
'use strict';
/* eslint-enable */
const expect = require('chai').expect;
const billController = require('../../../lib/controllers/bill.js');

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
          state: 'California',
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
    it('returns 500 if population data has failed', () => {
      const mockPopulationDataReader = {
        byDistrict: (state, district, callback) => {
          return callback(new Error('Population Error'));
        },
      };
      const subject = billController({ populationDataReader: mockPopulationDataReader });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'California',
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
    it('returns population in body is no error from population', () => {
      const mockPopulationDataReader = {
        byDistrict: (state, district, callback) => {
          return callback(null, 20);
        },
      };
      const subject = billController({ populationDataReader: mockPopulationDataReader });
      const mockReq = {
        query: {
          billId: 'id',
          state: 'California',
          district: 6,
        },
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({ population: 20 });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.getCensusData(mockReq, mockRes);
    });
  });
});
