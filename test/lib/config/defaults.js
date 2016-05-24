const expect = require('chai').expect;
const defaults = require('../../../lib/config/defaults.js');

describe('Defaults', () => {
  describe('Census', () => {
    it('can be instantiated from options', () => {
      const options = {
        host: '127.0.0.1',
        user: 'tester',
        password: 'TEST_CENSUS',
      };
      const census = defaults.census(options);
      expect(census).to.not.eql(null);
      expect(census.config.connectionConfig.host).to.eql('127.0.0.1');
      expect(census.config.connectionConfig.user).to.eql('tester');
      expect(census.config.connectionConfig.password).to.eql('TEST_CENSUS');
    });
  });
  describe('User', () => {
    it('can be instantiated from options', () => {
      const options = {
        host: '127.0.0.1',
        user: 'tester',
        password: 'TEST_USER',
      };
      const userPool = defaults.user(options);
      expect(userPool).to.not.eql(null);
      expect(userPool.config.connectionConfig.host).to.eql('127.0.0.1');
      expect(userPool.config.connectionConfig.user).to.eql('tester');
      expect(userPool.config.connectionConfig.password).to.eql('TEST_USER');
    });
  });
  describe('Cache', () => {
    it('can be instantiated from options', () => {
      const options = {
        host: '127.0.0.2',
        user: 'tester',
      };
      const subject = defaults.cache(options);
      expect(subject).to.not.eql(null);
      expect(subject.options.host).to.eql('127.0.0.2');
      expect(subject.options.user).to.eql('tester');
    });
  });
});
