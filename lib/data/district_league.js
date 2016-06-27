const LogManager = require('../logger/logger.js')();

/**
 * A Private function to handle results from the data store.
 * @param billId (string)
 * @param queryResult (object)
 * @param callback (function).
 */
function handleResults(billId, queryResult, callback) {
  const logger = LogManager.get('District::handleResults');
  const results = {
    total: 0,
    league: [],
  };
  if (!queryResult) {
    logger.info(`No results returned for Bill ${billId}`);
    return callback(null, results);
  }
  queryResult.forEach((result) => {
    results.total += result.hits;
    results.league.push({
      state: result.state,
      district: result.district,
      hits: result.hits,
    });
  });
  callback(null, results);
}

/**
 * A function to handle requests to the data store for
 * a district league given a billId
 * @param options (object) - contains injected properties.
 * @param params (object) - contains a billId
 * @param callback (function).
 */
function getLeague(options, params, callback) {
  const logger = LogManager.get('District::getLeague');
  if (!params.billId) {
    logger.error('Can not query data store without a billId');
    return callback(new Error('Must specify billId'));
  }
  options.pool.getConnection((err, connection) => {
    if (err) {
      logger.error(err.message);
      return callback(err);
    }

    const statement = `SELECT state, district, MAX(matchCount) as hits FROM ( SELECT ${options.info}.state as state, ${options.info}.district as district, COUNT(*) as matchCount FROM ${options.info} INNER JOIN ${options.votes} ON ${options.info}.user_id=${options.votes}.user_id WHERE bill_id=? AND ${options.info}.state is NOT NULL AND ${options.info}.district is NOT NULL GROUP BY ${options.info}.state, ${options.info}.district) g GROUP BY state;`;

    connection.execute(statement, [params.billId], (queryError, queryResult) => {
      connection.release();
      if (queryError) {
        logger.error(queryError.message);
        return callback(queryError);
      }
      handleResults(params.billId, queryResult, callback);
    });
  });
}

/**
 * District League Loader Interface
 * Defined Methods:
 *  - getLeague
 */
const distirctLeague = (options) => {
  return {
    getLeague: (params, callback) => {
      return getLeague(options, params, callback);
    },
  };
};
module.exports = distirctLeague;
