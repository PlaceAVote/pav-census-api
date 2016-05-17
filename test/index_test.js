const expect = require('chai').expect;

describe('Index', () => {
  it('Does not throw error', () => {
    const init = () => {
      /* eslint-disable */
      require('../index.js');
      /* eslint-enable */
    };
    expect(init).to.not.throw(Error);
  });
});
