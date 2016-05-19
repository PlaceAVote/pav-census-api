'use strict';
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
      const subject = billController({ populationDataReader: mockPopulationDataReader, countDataReader:
        mockCountDataReader });
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
      const subject = billController({ populationDataReader: mockPopulationDataReader, countDataReader:
        mockCountDataReader });
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
          return callback(null, { yes: 100, no: 30, total: 130 });
        },
      };
      const subject = billController({ populationDataReader: mockPopulationDataReader, countDataReader:
        mockCountDataReader });
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
            votes: {
              yes: 100,
              no: 30,
              total: 130,
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
    });
  });
});
