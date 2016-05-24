'use strict';
const defaults = require('../config/defaults.js');
const LogManager = defaults.logger();
const NoStateError = 'No State Defined';
const NoDistrictDefined = 'No District Defined';
const NoBillIdDefined = 'No Bill ID Defined';


/**
 * private helper method to create a params array.
 */
function buildParams(params) {
  const built = [params.billId];
  for (let i = 0; i < 12; i++) {
    built.push(params.state);
    built.push(params.district);
  }
  return built;
}

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

  const preparedParams = buildParams(params);
  options.pool.getConnection((poolError, connection) => {
    if (poolError) {
      logger.error(poolError.message, poolError.stack);
      return callback(poolError);
    }

    connection.execute(select, preparedParams, (err, rows) => {
      // Release the connection back into the shared pool.
      connection.release();
      if (err) {
        logger.error(err.message, err.stack);
        return callback(err, null);
      }
      if (!rows || rows.length === 0) {
        logger.info(`Returned no votes for bill ${params.billId}`);
        return callback(null, {});
      }
      const row = rows[0];
      callback(err, row);
    });
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
