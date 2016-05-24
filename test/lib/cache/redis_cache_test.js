'use strict';
const expect = require('chai').expect;
const cache = require('../../../lib/cache/redis_cache.js');

describe('Cache', () => {
  describe('Has Functions', () => {
    it('get', () => {
      const subject = cache();
      expect(subject.get).to.be.a('function');
    });

    it('set', () => {
      const subject = cache();
      expect(subject.get).to.be.a('function');
    });
  });

  describe('get', () => {
    it('returns object version stored in cache', (done) => {
      let askedKey;
      const client = {
        get: (key, cb) => {
          askedKey = key;
          cb(null, JSON.stringify({ id: 'hello', name: 'test' }));
        },
      };
      const subject = cache({ client: client });
      subject.get('hello', (result) => {
        expect(askedKey).to.eql('hello');
        expect(result.id).to.eql('hello');
        expect(result.name).to.eql('test');
        done();
      });
    });

    it('logs error returns null result when client returns an error', (done) => {
      const client = {
        get: (key, cb) => {
          cb(new Error('Cache Error'), JSON.stringify({ id: 'hello', name: 'test' }));
        },
      };
      const subject = cache({ client: client });
      subject.get('hello', (err) => {
        expect(err).to.eql(null);
        done();
      });
    });

    it('logs error returns null result when json parse fails', (done) => {
      const client = {
        get: (key, cb) => {
          cb(null, '{id: unParseable}');
        },
      };
      const subject = cache({ client: client });
      subject.get('hello', (err) => {
        expect(err).to.eql(null);
        done();
      });
    });
  });
  describe('set', () => {
    it('returns null error if set is successful', (done) => {
      let setParams;
      const client = {
        setex: (params, cb) => {
          setParams = params;
          cb(null);
        },
      };
      const subject = cache({ client: client });
      subject.set({ key: 'id', ttl: 300, body: { hello: 'world' } }, (err) => {
        expect(err).to.eql(null);
        expect(setParams[0]).to.eql('id');
        expect(setParams[1]).to.eql(300);
        expect(setParams[2]).to.eql(JSON.stringify({ hello: 'world' }));
        done();
      });
    });

    it('returns error if object doesnt have a key', (done) => {
      let called = false;
      const client = {
        setex: (params, cb) => {
          called = true;
          cb(null);
        },
      };
      const subject = cache({ client: client });
      subject.set({ ttl: 300, body: { hello: 'world' } }, (err) => {
        expect(err.message).to.eql('Missing Key');
        expect(called).to.eql(false);
        done();
      });
    });

    it('wont cache object without body', (done) => {
      let called = false;
      const client = {
        setex: (params, cb) => {
          called = true;
          cb(null);
        },
      };
      const subject = cache({ client: client });
      subject.set({ ttl: 300, key: 'key' }, (err) => {
        expect(err.message).to.eql('Missing Body');
        expect(called).to.eql(false);
        done();
      });
    });

    it('uses fallback ttl when non is provided', (done) => {
      let calledParams;
      const client = {
        setex: (params, cb) => {
          calledParams = params;
          cb(null);
        },
      };
      const subject = cache({ client: client });
      subject.set({ body: { id: 'key' }, key: 'key' }, (err) => {
        expect(err).to.eql(null);
        expect(calledParams[1]).to.eql(10800);
        done();
      });
    });

    it('logs and returns error from client in callback', (done) => {
      const client = {
        setex: (params, cb) => {
          cb(new Error('Cache-Client Error'));
        },
      };
      const subject = cache({ client: client });
      subject.set({ body: { id: 'key' }, key: 'key' }, (err) => {
        expect(err.message).to.eql('Cache-Client Error');
        done();
      });
    });
  });
});
