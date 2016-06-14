const expect = require('chai').expect;
const districtLeagueController = require('../../../lib/controllers/district_league.js');

describe('DistrictLeagueController', () => {
  describe('Has Properties', () => {
    it('handleLeagueRequest', () => {
      const ctrl = districtLeagueController();
      expect(ctrl.handleLeagueRequest).to.be.a('function');
    });
  });

  describe('handleLeagueRequest', () => {
    it('returns 400 if bill id is not defined', () => {
      const subject = districtLeagueController();
      const mockReq = {
        query: {},
      };
      const mockRes = {
        send: (b) => {
          expect(b).to.eql({ message: 'Invalid Request' });
        },
      };
      expect(mockRes.statusCode).to.eql(undefined);
      subject.handleLeagueRequest(mockReq, mockRes);
      expect(mockRes.statusCode).to.eql(400);
    });

    it('returns on object from the cache if present', () => {
      const mockReq = {
        query: {
          billId: 'hr2-123',
        },
      };
      let expectedKey;
      const data = {
        total: 15,
        league: [
          { state: 'CA', district: 3, hits: 15 },
        ],
      };
      const mockCache = {
        get: (key, cb) => {
          expectedKey = key;
          cb(data);
        },
      };
      let expectedResult;
      const mockRes = {
        send: (b) => {
          expectedResult = b;
        },
      };
      const options = {
        cache: mockCache,
      };
      const subject = districtLeagueController(options);
      subject.handleLeagueRequest(mockReq, mockRes);
      expect(expectedKey).to.eql('hr2-123-districtleague');
      expect(expectedResult).to.eql(data);
    });

    it('returns an error if the data loader returns an error', () => {
      const mockReq = {
        query: {
          billId: 'hr2-123',
        },
      };
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
      };
      let expectedResult;
      const mockRes = {
        send: (b) => {
          expectedResult = b;
        },
      };
      let expectedParams;
      const mockDistrictLoader = {
        getLeague: (params, cb) => {
          expectedParams = params;
          cb(new Error('DB ERROR'));
        },
      };
      const options = {
        cache: mockCache,
        dataLoader: mockDistrictLoader,
      };
      const subject = districtLeagueController(options);
      subject.handleLeagueRequest(mockReq, mockRes);
      expect(expectedParams).to.eql({ billId: 'hr2-123' });
      expect(expectedResult).to.eql({ message: 'Internal Server Error' });
      expect(mockRes.statusCode).to.eql(500);
    });

    it('returns the response and sets the item in the cache', () => {
      const mockReq = {
        query: {
          billId: 'hr2-123',
        },
      };
      const data = {
        total: 15,
        league: [
          { state: 'CA', district: 3, hits: 15 },
        ],
      };
      let expectedCached;
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
        set: (body, cb) => {
          expectedCached = body;
          cb();
        },
      };
      let expectedResult;
      const mockRes = {
        send: (b) => {
          expectedResult = b;
        },
      };
      const mockDistrictLoader = {
        getLeague: (params, cb) => {
          cb(null, data);
        },
      };
      const options = {
        cache: mockCache,
        dataLoader: mockDistrictLoader,
      };
      const subject = districtLeagueController(options);
      subject.handleLeagueRequest(mockReq, mockRes);
      expect(expectedResult).to.eql(data);
      expect(expectedCached).to.eql({ key: 'hr2-123-districtleague', body: data });
    });

    it('will not cause an error if the cache set fails', () => {
      const mockReq = {
        query: {
          billId: 'hr2-123',
        },
      };
      const data = {
        total: 15,
        league: [
          { state: 'CA', district: 3, hits: 15 },
        ],
      };
      const mockCache = {
        get: (key, cb) => {
          cb(null);
        },
        set: (body, cb) => {
          cb(new Error('Cache Issue'));
        },
      };
      let expectedResult;
      const mockRes = {
        send: (b) => {
          expectedResult = b;
        },
      };
      const mockDistrictLoader = {
        getLeague: (params, cb) => {
          cb(null, data);
        },
      };
      const options = {
        cache: mockCache,
        dataLoader: mockDistrictLoader,
      };
      const subject = districtLeagueController(options);
      subject.handleLeagueRequest(mockReq, mockRes);
      expect(expectedResult).to.eql(data);
    });
  });
});
