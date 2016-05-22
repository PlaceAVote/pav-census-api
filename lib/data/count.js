'use strict';
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
  const select = `SELECT COUNT(u1.user_id) AS total_votes,
        COUNT(yv.user_id) AS total_yes_votes,
        COUNT(nv.user_id) AS total_no_votes,
        COUNT(m1.user_id) AS total_male_votes,
        COUNT(f1.user_id) AS total_female_votes,
        COUNT(t1.user_id) AS total_non_binary_votes
        FROM ${options.votes} AS v1
        JOIN ${options.info} AS u1 ON v1.bill_id='${params.billId}' AND v1.user_id=u1.user_id AND
        u1.state='${params.state}' AND u1.district='${params.district}'
        LEFT JOIN ${options.info} AS m1 ON v1.user_id=m1.user_id AND m1.state='${params.state}' AND
        m1.district='${params.district}' AND m1.gender='male'
        LEFT JOIN ${options.info} AS f1 ON v1.user_id=f1.user_id AND f1.state='${params.state}' AND
        f1.district='${params.district}' AND f1.gender='female'
        LEFT JOIN ${options.info} AS t1 ON v1.user_id=t1.user_id AND t1.state='${params.state}' AND
        t1.district='${params.district}' AND t1.gender='they'
        LEFT JOIN ${options.info} AS yv ON v1.user_id=yv.user_id AND yv.state='${params.state}' AND
        yv.district='${params.district}' AND v1.vote=1
        LEFT JOIN ${options.info} AS nv ON v1.user_id=nv.user_id AND nv.state='${params.state}' AND
        nv.district='${params.district}' AND v1.vote=0;`;
  options.connection.query(select, (err, rows) => {
    if (err) {
      logger.error(err.message, err.stack);
      return callback(err, null);
    }
    const results = {
      yes: 0,
      no: 0,
      total: 0,
      male: 0,
      female: 0,
      nonBinary: 0,
    };
    if (!rows || rows.length === 0) {
      logger.info(`Returned no votes for bill ${params.billId}`);
      return callback(null, results);
    }

    const row = rows[0];
    results.yes = row.total_yes_votes || 0;
    results.no = row.total_no_votes || 0;
    results.total = row.total_votes || 0;
    results.male = row.total_male_votes || 0;
    results.female = row.total_female_votes || 0;
    results.nonBinary = row.total_non_binary_votes || 0;
    callback(err, results);
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
