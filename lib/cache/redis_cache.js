const defaults = require('../config/defaults.js');
const LogManager = defaults.logger();

const TTL = (60 * 60) * 3;

/**
 * Wrapper around get, parses the response.
 */
function get(options, key, callback) {
  const logger = LogManager.get('Cache::get');
  options.client.get(key, (err, r) => {
    if (err) {
      logger.error(`Returned error from cache client ${err.message}`);
      return callback(null);
    }
    try {
      const body = JSON.parse(r);
      return callback(body);
    } catch (e) {
      logger.error(`Parsing Error ${e.message}`);
      return callback(null);
    }
  });
}

/**
 * Wrapper around set, determines whether it should set a ttl.
 */
function set(options, params, callback) {
  const logger = LogManager.get('Cache::set');
  const client = options.client;
  if (!params.key) {
    logger.warn('Cant cache object without a key');
    return callback(new Error('Missing Key'));
  }
  if (!params.body) {
    logger.warn('Cant cache object without a body');
    return callback(new Error('Missing Body'));
  }
  if (!params.ttl) {
    logger.warn(`No defined TTL, falling back to default ${TTL} seconds`);
    params.ttl = TTL;
  }
  client.setex([params.key, params.ttl, JSON.stringify(params.body)], (err) => {
    if (err) {
      logger.error(err.message, err.stack);
      return callback(err);
    }
    return callback(null);
  });
}

const cache = (options) => {
  return {
    get: (key, callback) => {
      return get(options, key, callback);
    },
    set: (params, callback) => {
      return set(options, params, callback);
    },
  };
};

module.exports = cache;
