const LogManager = require('../logger/logger.js')();

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

// TODO docs.
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

    const statement = `SELECT state, district, MAX(matchCount) as hits FROM ( SELECT ${options.info}.state as state, ${options.info}.district as district, COUNT(*) as matchCount FROM ${options.info} INNER JOIN ${options.votes} ON ${options.info}.user_id=${options.votes}.user_id WHERE bill_id=? AND ${options.info}.state is NOT NULL GROUP BY ${options.info}.state, ${options.info}.district) g GROUP BY state;`;

    connection.execute(statement, [params.billId], (queryError, queryResult) => {
      if (queryError) {
        logger.error(queryError.message);
        return callback(queryError);
      }
      handleResults(params.billId, queryResult, callback);
    });
  });
}

const distirctLeague = (options) => {
  return {
    getLeague: (params, callback) => {
      return getLeague(options, params, callback);
    },
  };
};
module.exports = distirctLeague;
