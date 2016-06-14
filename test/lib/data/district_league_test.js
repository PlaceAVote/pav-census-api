const expect = require('chai').expect;
const distirctLeague = require('../../../lib/data/district_league.js');

describe('District League', () => {
  describe('Has Properties', () => {
    it('getLeague', () => {
      const loader = distirctLeague();
      expect(loader.getLeague).to.be.a('function');
    });
  });
  describe('getLeague', () => {
    it('returns error to callback if bill Id is not defined', (done) => {
      const loader = distirctLeague();
      loader.getLeague({}, (err) => {
        expect(err).to.not.eql(null);
        expect(err.message).to.eql('Must specify billId');
        done();
      });
    });

    it('calls sql data loader with correct params', (done) => {
      let actualParams;
      let actualStatement;
      const pool = {
        getConnection: (cb) => {
          const connection = {
            execute: (statement, preparedParams, ecb) => {
              actualStatement = statement;
              actualParams = preparedParams;
              ecb(null);
            },
            release: () => {},
          };
          cb(null, connection);
        },
      };
      const options = {
        pool: pool,
        info: 'user_info',
        votes: 'user_votes',
      };
      const loader = distirctLeague(options);
      loader.getLeague({ billId: 'hr2014' }, (err) => {
        expect(err).to.eql(null);
        expect(actualParams.length).to.eql(1);
        expect(actualParams[0]).to.eql('hr2014');
        expect(actualStatement).to.eql('SELECT state, district, MAX(matchCount) as hits FROM ( SELECT user_info.state as state, user_info.district as district, COUNT(*) as matchCount FROM user_info INNER JOIN user_votes ON user_info.user_id=user_votes.user_id WHERE bill_id=? AND user_info.state is NOT NULL GROUP BY user_info.state, user_info.district) g GROUP BY state;');
        done();
      });
    });

    it('returns an error when the connection cant be established', (done) => {
      const pool = {
        getConnection: (cb) => {
          cb(new Error('Cant aquire a connection'), null);
        },
      };
      const options = {
        pool: pool,
        info: 'user_info',
        votes: 'user_votes',
      };
      const loader = distirctLeague(options);
      loader.getLeague({ billId: 'hr2014' }, (err) => {
        expect(err).to.not.eql(null);
        expect(err.message).to.eql('Cant aquire a connection');
        done();
      });
    });

    it('returns a query error from the data store', (done) => {
      const pool = {
        getConnection: (cb) => {
          const connection = {
            execute: (statement, preparedParams, ecb) => {
              ecb(new Error('No Dogs Allowed'));
            },
            release: () => {},
          };
          cb(null, connection);
        },
      };
      const options = {
        pool: pool,
        info: 'user_info',
        votes: 'user_votes',
      };
      const loader = distirctLeague(options);
      loader.getLeague({ billId: 'hr2014' }, (err) => {
        expect(err).to.not.eql(null);
        expect(err.message).to.eql('No Dogs Allowed');
        done();
      });
    });

    it('returns a results set from the data store', (done) => {
      const pool = {
        getConnection: (cb) => {
          const connection = {
            execute: (statement, preparedParams, ecb) => {
              ecb(null, [
                { state: 'CA', distirct: 33, hits: 13 },
                { state: 'FL', distirct: 6, hits: 1 },
                { state: 'GA', distirct: 6, hits: 2 },
                { state: 'NY', distirct: 3, hits: 2 },
              ]);
            },
            release: () => {},
          };
          cb(null, connection);
        },
      };
      const options = {
        pool: pool,
        info: 'user_info',
        votes: 'user_votes',
      };
      const loader = distirctLeague(options);
      loader.getLeague({ billId: 'hr2014' }, (err, results) => {
        expect(err).to.eql(null);
        expect(results.total).to.eql(18);
        expect(results.league.length).to.eql(4);
        done();
      });
    });

    it('if results are null then we should return an empty array', (done) => {
      const pool = {
        getConnection: (cb) => {
          const connection = {
            execute: (statement, preparedParams, ecb) => {
              ecb(null);
            },
            release: () => {},
          };
          cb(null, connection);
        },
      };
      const options = {
        pool: pool,
        info: 'user_info',
        votes: 'user_votes',
      };
      const loader = distirctLeague(options);
      loader.getLeague({ billId: 'hr2014' }, (err, results) => {
        expect(err).to.eql(null);
        expect(results.total).to.eql(0);
        expect(results.league.length).to.eql(0);
        done();
      });
    });
  });
});
