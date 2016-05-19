const defaults = require('../config/defaults.js');
const LogManager = defaults.logger();
const NoStateError = 'No State Defined';
const NoDistrictDefined = 'No District Defined';
const NoBillIdDefined = 'No Bill ID Defined';

/**
 * Return a count of yes/no votes on a bill for a particular State and District.
 * @param {Object} - Params Hash: should contain state, district and billId.
 * @returns {err} - An Error in the callback if one occurs.
 * @returns {Object} - a count of yes/no votes within a State and District.
 */
function byDistrict(options, params, callback) {
  const logger = LogManager.get('Count::byDistrict');
  if (!params.state) {
    logger.warn(NoStateError);
    return callback(new Error(NoStateError), null);
  }
  if (!params.district) {
    logger.warn(NoDistrictDefined);
    return callback(new Error(NoDistrictDefined), null);
  }
  if (!params.billId) {
    logger.warn(NoBillIdDefined);
    return callback(new Error(NoBillIdDefined), null);
  }
  const select = `SELECT vote FROM ${options.info} INNER JOIN ${options.votes} ON ${options.votes}.user_id WHERE state = '${params.state}' AND district = ${params.district} AND bill_id = '${params.billId}'`;
  options.connection.query(select, (err, rows) => {
    if (err) {
      logger.error(err.message, err.stack);
      return callback(err, null);
    }
    const results = {
      yes: 0,
      no: 0,
      total: 0,
    };
    if (!rows || rows.length === 0) {
      logger.info(`Returned no votes for bill ${params.billId}`);
      return callback(null, results);
    }
    // TODO @histoiredebabar: iterate over the returned dataset and count yes no votes.
    callback(err, rows);
  });
}

const count = (options) => {
  return {
    byDistrict: (params, callback) => {
      return byDistrict(options, params, callback);
    },
  };
};

module.exports = count;
