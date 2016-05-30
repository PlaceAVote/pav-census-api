const LogManager = require('../logger/logger.js')();
const noParamsDefine = 'Must provide params';
const noStateDefined = 'Must specify state in params';
const noDistrictDefined = 'Must specify district in params';
const noBillIdDefined = 'Must specify bill Id in params';
const noRangeDefined = 'Must specify range in params';
// const async = require('async');

function setResult(row, breakdown) {
  breakdown[row.gender][row.votes] += row['COUNT(vote)'];
  breakdown[row.gender].total += row['COUNT(vote)'];
}


function getGenderBreakdownForAgeRange(options, params, callback) {
  const logger = LogManager.get('Count::getGenderBreakdownForAgeRange');
  if (!params) {
    logger.error(noParamsDefine);
    return callback(new Error(noParamsDefine));
  }
  if (!params.state) {
    logger.error(noStateDefined);
    return callback(new Error(noStateDefined));
  }
  if (!params.district) {
    logger.error(noDistrictDefined);
    return callback(new Error(noDistrictDefined));
  }
  if (!params.billId) {
    logger.error(noBillIdDefined);
    return callback(new Error(noBillIdDefined));
  }
  if (!params.range || !params.range.min || !params.range.max) {
    logger.error(noRangeDefined);
    return callback(new Error(noRangeDefined));
  }

  options.pool.getConnection((connectionError, connection) => {
    if (connectionError) {
      logger.error('Connection Error', connectionError.message, connectionError.stack);
      return callback(connectionError);
    }
    const statement = `SELECT gender,
      CASE WHEN vote = 1 THEN 'yes'
      WHEN vote = 0 THEN 'no'
      ELSE '<unknown>'
      END as votes,
      COUNT(vote) FROM (
      SELECT vote, gender,
      TIMESTAMPDIFF(YEAR, FROM_UNIXTIME(dob/1000), CURDATE()) AS 'age'
      FROM ${options.info} AS u
      JOIN ${options.votes} AS v ON u.user_id = v.user_id
      WHERE u.state = ? AND u.district = ? AND v.bill_id = ?
      HAVING age >= ${params.range.min} AND age <= ${params.range.max}
      ) AS T GROUP BY gender, votes;`;

    const preparedParams = [params.state, params.district, params.billId];
    connection.execute(statement, preparedParams, (err, result) => {
      connection.release();
      const breakdown = {
        male: {
          total: 0,
          yes: 0,
          no: 0,
        },
        female: {
          total: 0,
          yes: 0,
          no: 0,
        },
        they: {
          total: 0,
          yes: 0,
          no: 0,
        },
      };
      if (err) {
        logger.error('Error from Age Ranges Query:', err.message, err.stack);
        return callback(null, breakdown);
      }
      if (!result) {
        logger.info('Undefined Results returned from datastore');
        return callback(null, breakdown);
      }
      result.forEach((row) => {
        setResult(row, breakdown);
      });
      callback(err, breakdown);
    });
  });
}

function getGenderBreakdownForAgeRanges(options, params, callback) {
  callback(new Error('Not Yet Implemented'));
}

/**
 * Defines the gender data layer API.
 * Options must have a DB connection.
 */
const dataSamples = (options) => {
  return {
    getGenderBreakdownForAgeRanges: (params, callback) => {
      return getGenderBreakdownForAgeRanges(options, params, callback);
    },
    getGenderBreakdownForAgeRange: (params, callback) => {
      return getGenderBreakdownForAgeRange(options, params, callback);
    },
  };
};

module.exports = dataSamples;
