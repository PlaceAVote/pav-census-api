'use strict';
const expect = require('chai').expect;
const population = require('../../../lib/data/population.js');

describe('Population', () => {
  describe('Has functions', () => {
    it('byDistrict', () => {
      const subject = population();
      expect(subject.byDistrict).to.be.a('function');
    });
    it('byDistrictAndGender', () => {
      const subject = population();
      expect(subject.byDistrictAndGender).to.be.a('function');
    });
    it('byDistrictGenderAndRange', () => {
      const subject = population();
      expect(subject.byDistrictGenderAndRange).to.be.a('function');
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
  describe('byDistrictAndGender', () => {
    it('returns null if state not defined', (done) => {
      const subject = population();
      subject.byDistrictAndGender({ state: undefined, district: '6', gender: 'M' }, (err, result) => {
        expect(err.message).to.eql('No State Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    it('returns null if district not defined', (done) => {
      const subject = population();
      subject.byDistrictAndGender({ state: 'CA', district: undefined, gender: 'M' }, (err, result) => {
        expect(err.message).to.eql('No District Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    it('returns null if gender is not defined', (done) => {
      const subject = population();
      subject.byDistrictAndGender({ state: 'CA', district: 6, gender: undefined }, (err, result) => {
        expect(err.message).to.eql('No Gender Defined');
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
      subject.byDistrictAndGender({ state: 'CA', district: 6, gender: 'M' }, (err) => {
        expect(err).to.eql(null);
        expect(string).to.eql('SELECT SUM(population) FROM census_data WHERE state = ? AND district = ? AND gender = ?');
        expect(prepared.length).to.eql(3);
        expect(prepared[0]).to.eql('CA');
        expect(prepared[1]).to.eql(6);
        expect(prepared[2]).to.eql('M');
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
      subject.byDistrictAndGender({ state: 'CA', district: 6, gender: 'F' }, (err, result) => {
        expect(err.message).to.eql('SQL ERROR');
        expect(result).to.eql(null);
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
      subject.byDistrictAndGender({ state: 'CA', district: 6, gender: 'M' }, (err) => {
        expect(err.message).to.eql('Connection Pool Error');
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
      subject.byDistrictAndGender({ state: 'CA', district: 6, gender: 'M' }, (err, result) => {
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
      subject.byDistrictAndGender({ state: 'CA', district: 6, gender: 'M' }, (err, result) => {
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
      subject.byDistrictAndGender({ state: 'CA', district: 6, gender: 'F' }, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql(0);
        done();
      });
    });
  });
  describe('byDistrictAndGender', () => {
    it('returns null if state not defined', (done) => {
      const subject = population();
      subject.byDistrictGenderAndRange({ state: undefined, district: '6', gender: 'M', range: { lowAge: 18, highAge: 25 } }, (err, result) => {
        expect(err.message).to.eql('No State Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    it('returns null if district not defined', (done) => {
      const subject = population();
      subject.byDistrictGenderAndRange({ state: 'CA', district: undefined, gender: 'M', range: { lowAge: 18, highAge: 25 } }, (err, result) => {
        expect(err.message).to.eql('No District Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    it('returns null if gender is not defined', (done) => {
      const subject = population();
      subject.byDistrictGenderAndRange({ state: 'CA', district: 6, gender: undefined, range: { lowAge: 18, highAge: 25 } }, (err, result) => {
        expect(err.message).to.eql('No Gender Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    it('returns null if range is not defined', (done) => {
      const subject = population();
      subject.byDistrictGenderAndRange({ state: 'CA', district: 6, gender: 'M' }, (err, result) => {
        expect(err.message).to.eql('No Range Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    it('returns null if range.lowAge is not defined', (done) => {
      const subject = population();
      subject.byDistrictGenderAndRange({ state: 'CA', district: 6, gender: 'M', range: { lowAge: undefined, highAge: 25 } }, (err, result) => {
        expect(err.message).to.eql('No Range Defined');
        expect(result).to.eql(null);
        done();
      });
    });

    it('returns null if range.highAge is not defined', (done) => {
      const subject = population();
      subject.byDistrictGenderAndRange({ state: 'CA', district: 6, gender: 'M', range: { lowAge: 6, highAge: undefined } }, (err, result) => {
        expect(err.message).to.eql('No Range Defined');
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
      subject.byDistrictGenderAndRange({ state: 'CA', district: 6, gender: 'M', range: { lowAge: 6, highAge: 20 } }, (err, result) => {
        expect(err).to.eql(null);
        expect(string).to.eql('SELECT SUM(population) FROM census_data WHERE state = ? AND district = ? AND gender = ? AND age_low >= ? AND age_high <= ? AND age_high > 0');
        expect(prepared.length).to.eql(5);
        expect(prepared[0]).to.eql('CA');
        expect(prepared[1]).to.eql(6);
        expect(prepared[2]).to.eql('M');
        expect(prepared[3]).to.eql(6);
        expect(prepared[4]).to.eql(20);
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
      subject.byDistrictGenderAndRange({ state: 'CA', district: 6, gender: 'M', range: { lowAge: 6, highAge: 20 } }, (err, result) => {
        expect(err.message).to.eql('SQL ERROR');
        expect(result).to.eql(null);
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
      subject.byDistrictGenderAndRange({ state: 'CA', district: 6, gender: 'M', range: { lowAge: 6, highAge: 20 } }, (err, result) => {
        expect(err.message).to.eql('Connection Pool Error');
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
      subject.byDistrictGenderAndRange({ state: 'CA', district: 6, gender: 'M', range: { lowAge: 6, highAge: 20 } }, (err, result) => {
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
      subject.byDistrictGenderAndRange({ state: 'CA', district: 6, gender: 'M', range: { lowAge: 6, highAge: 20 } }, (err, result) => {
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
      subject.byDistrictGenderAndRange({ state: 'CA', district: 6, gender: 'M', range: { lowAge: 6, highAge: 20 } }, (err, result) => {
        expect(err).to.eql(null);
        expect(result).to.eql(0);
        done();
      });
    });
  });
});
