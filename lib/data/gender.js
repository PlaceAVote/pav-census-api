const LogManager = require('../logger/logger.js')();
/*
const noStateDefined = 'No State Defined';
const noDistrictDefined = 'No District Defined';
const noBillIdDefined = 'No Bill ID Defined';
const male = 'male';
const female = 'female';
*/
const async = require('async');


/**
 *  * Return number of votes for given age range on state & district.
 *   */
function byAgeRange(options, params, row, callback) {
  const logger = LogManager.get('Count::byAgeRange');
  options.pool.getConnection((connectionError, connection) => {
    if (connectionError) {
      logger.error(connectionError.message, connectionError.stack);
      return callback(connectionError);
    }
    const select = `SELECT gender,
          CASE WHEN vote = 1 THEN 'yes'
            WHEN vote = 0 THEN 'no'
            ELSE '<unknown>'
            END as votes,
          COUNT(vote) FROM (
              SELECT vote, gender,
              TIMESTAMPDIFF(YEAR, FROM_UNIXTIME(dob/1000), CURDATE()) AS 'age'
              FROM ${options.userInfo}
              JOIN ${options.userVotes} ON ${options.userInfo}.user_id = ${options.userVotes}.user_id AND
              ${options.userVotes}.bill_id= ?
              WHERE ${options.userInfo}.state = ? AND ${options.userInfo}.district = ?
              HAVING age >= ${row.age_low} AND age <= ${row.age_high}
              ) AS T GROUP BY gender, votes`;

    const preparedParams = [params.billId, params.state, params.district];
    connection.execute(select, preparedParams, (executeError, pavRows) => {
      connection.release();
      if (executeError) {
        logger.error(executeError.message, executeError.stack);
        return callback(executeError, null);
      }
      const range = {
        minAge: row.age_low,
        maxAge: row.age_high,
        votes: {
          total: 0,
          yes: 0,
          no: 0,
        },
      };

      if (!pavRows || pavRows.length === 0) {
        logger.info(`Returned no ranges for ${row.age_low} <= age <= ${row.age_high}`);
        return callback(null, range);
      }
      // return a mapped object we can work with.
      return callback(null, pavRows);
    });
  });
}

function byMultipleAgeRanges(options, params, gender, callback) {
  const logger = LogManager.get('Count::byMultipleAgeRanges');

  options.pool.getConnection((poolErr, connection) => {
    if (poolErr) {
      logger.error(poolErr);
      return callback(poolErr);
    }

    const select = `SELECT age_low, age_high FROM ${options.census} WHERE state = ? AND district = ? AND gender = '${gender}'`;

    const preparedParams = [params.state, params.district];
    connection.execute(select, preparedParams, (executeErr, rows) => {
      connection.release();
      if (executeErr) {
        logger.error(executeErr.message, executeErr.stack);
        return callback(executeErr, null);
      }
      if (!rows || rows.length === 0) {
        logger.info(`Returned no age ranges for gender ${gender}`);
        return callback(null, []);
      }
      async.map(rows, (row, cb) => {
        byAgeRange(options, params, row, cb);
      }, (error, results) => {
        if (error) {
          return callback(error);
        }
        callback(results);
      });
    });
  });
}

/**
 * Defines the gender data layer API.
 * Options must have a DB connection.
 */
const dataSamples = (options) => {
  return {
    byMultipleAgeRanges: (params, gender, callback) => {
      return byMultipleAgeRanges(options, params, gender, callback);
    },
  };
};

module.exports = dataSamples;
