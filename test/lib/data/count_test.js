'use strict';
const expect = require('chai').expect;
const count = require('../../../lib/data/count.js');

describe('Count', () => {
  describe('Has functions', () => {
    it('byDistrict', () => {
      const subject = count();
      expect(subject.byDistrict).to.be.a('function');
    });
  });

  describe('byDistrict', () => {
    it('returns null if state not defined', (done) => {
      const subject = count();
      subject.byDistrict({ state: undefined, district: '6' }, (err, result) => {
        expect(err.message).to.eql('No State Defined');
        expect(result).to.eql(null);
        done();
      });
    });
    it('returns null if district not defined', (done) => {
      const subject = count();
      subject.byDistrict({ state: 'CA', district: undefined }, (err, result) => {
        expect(err.message).to.eql('No District Defined');
        expect(result).to.eql(null);
        done();
      });
    });
    it('returns null if bill not defined', (done) => {
      const subject = count();
      subject.byDistrict({ state: 'CA', district: 6, billId: undefined }, (err, result) => {
        expect(err.message).to.eql('No Bill ID Defined');
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

      const options = {
        pool: pool,
        table: 'census_data',
        info: 'user_info',
        votes: 'user_info',
      };
      const subject = count(options);
      const params = {
        state: 'CA',
        district: 6,
        billId: 'hr2014-12',
      };
      subject.byDistrict(params, (err) => {
        const select = `SELECT COUNT(u1.user_id) AS total,
        COUNT(yv.user_id) AS yes,
        COUNT(nv.user_id) AS no,
        COUNT(m1.user_id) AS male,
        COUNT(f1.user_id) AS female,
        COUNT(t1.user_id) AS nonBinary,
        COUNT(m2.user_id) AS maleYes,
        COUNT(m3.user_id) AS maleNo,
        COUNT(f2.user_id) AS femaleYes,
        COUNT(f3.user_id) AS femaleNo,
        COUNT(t2.user_id) AS nonBinaryYes,
        COUNT(t3.user_id) AS nonBinaryNo
        FROM ${options.votes} AS v1
        JOIN ${options.info} AS u1 ON v1.bill_id=? AND v1.user_id=u1.user_id AND
        u1.state=? AND u1.district=?
        LEFT JOIN ${options.info} AS m1 ON v1.user_id=m1.user_id AND m1.state=? AND
        m1.district=? AND m1.gender='male'
        LEFT JOIN ${options.info} AS f1 ON v1.user_id=f1.user_id AND f1.state=? AND
        f1.district=? AND f1.gender='female'
        LEFT JOIN ${options.info} AS t1 ON v1.user_id=t1.user_id AND t1.state=? AND
        t1.district=? AND t1.gender='they'
        LEFT JOIN ${options.info} AS yv ON v1.user_id=yv.user_id AND yv.state=? AND
        yv.district=? AND v1.vote=1
        LEFT JOIN ${options.info} AS nv ON v1.user_id=nv.user_id AND nv.state=? AND
        nv.district=? AND v1.vote=0
        LEFT JOIN ${options.info} AS m2 ON v1.user_id=m2.user_id AND m2.state=? AND
        m2.district=? AND v1.vote=1 AND m2.gender='male'
        LEFT JOIN ${options.info} AS m3 ON v1.user_id=m3.user_id AND m3.state=? AND
        m3.district=? AND v1.vote=0 AND m3.gender='male'
        LEFT JOIN ${options.info} AS f2 ON v1.user_id=f2.user_id AND f2.state=? AND
        f2.district=? AND v1.vote=1 AND f2.gender='female'
        LEFT JOIN ${options.info} AS f3 ON v1.user_id=f3.user_id AND f3.state=? AND
        f3.district=? AND v1.vote=0 AND f3.gender='female'
        LEFT JOIN ${options.info} AS t2 ON v1.user_id=t2.user_id AND t2.state=? AND
        t2.district=? AND v1.vote=1 AND t2.gender='they'
        LEFT JOIN ${options.info} AS t3 ON v1.user_id=t3.user_id AND t3.state=? AND
        t3.district=? AND v1.vote=0 AND t3.gender='female';`;
        expect(err).to.eql(null);
        expect(string).to.eql(select);
        expect(prepared.length).to.eql(25);
        expect(prepared.indexOf('CA')).to.not.eql(-1);
        expect(prepared.indexOf(6)).to.not.eql(-1);
        expect(prepared.indexOf('hr2014-12')).to.not.eql(-1);
        done();
      });
    });

    it('returns no rows from the sql backend will return empty object', (done) => {
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
        table: 'census_data',
        info: 'user_info',
        votes: 'user_info',
      };
      const subject = count(options);
      const params = {
        state: 'CA',
        district: 6,
        billId: 'hr2014-12',
      };
      subject.byDistrict(params, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql({});
        expect();
        done();
      });
    });

    it('returns emptry object if that is whats returned from sql backend', (done) => {
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
      const options = {
        pool: pool,
        table: 'census_data',
        info: 'user_info',
        votes: 'user_info',
      };
      const subject = count(options);
      const params = {
        state: 'CA',
        district: 6,
        billId: 'hr2014-12',
      };
      subject.byDistrict(params, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql({});
        expect();
        done();
      });
    });

    it('returns an error from sql in the outer callback', (done) => {
      let released;
      const pool = {
        getConnection: (cb) => {
          const connection = {
            execute: (statement, preparedParams, ecb) => {
              ecb(new Error('SQL ERROR'));
            },
            release: () => {
              released = true;
            },
          };
          cb(null, connection);
        },
      };
      const subject = count({ pool: pool, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6, billId: 'billId' }, (err, result) => {
        expect(err.message).to.eql('SQL ERROR');
        expect(result).to.eql(null);
        expect(released).to.eql(true);
        done();
      });
    });

    it('returns empty object if theres no items in the returned array', (done) => {
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
      const subject = count({ pool: pool, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6, billId: 'billId' }, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql({});
        done();
      });
    });

    it('returns the count returns from the sql query', (done) => {
      const pool = {
        getConnection: (cb) => {
          const connection = {
            execute: (statement, preparedParams, ecb) => {
              ecb(null, [{ total: 12, yes: 8, no: 4, male: 2, female: 3, nonBinary: 7, maleYes: 1, maleNo: 1,
            femaleYes: 1, femaleNo: 2, nonBinaryYes: 5, nonBinaryNo: 2 }]);
            },
            release: () => {},
          };
          cb(null, connection);
        },
      };
      const subject = count({ pool: pool, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6, billId: 'billId' }, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql({ total: 12, yes: 8, no: 4, male: 2, female: 3, nonBinary: 7, maleYes: 1, maleNo: 1,
            femaleYes: 1, femaleNo: 2, nonBinaryYes: 5, nonBinaryNo: 2 });
        done();
      });
    });

    it('returns an error from getConnection - no pool available', (done) => {
      const pool = {
        getConnection: (cb) => {
          cb(new Error('No Pool Available'));
        },
      };
      const subject = count({ pool: pool, table: 'census_data' });
      subject.byDistrict({ state: 'CA', district: 6, billId: 'billId' }, (err) => {
        expect(err.message).to.eql('No Pool Available');
        done();
      });
    });
  });
});
