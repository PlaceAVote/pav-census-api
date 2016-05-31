const LogManager = require('../logger/logger.js')();
const noParamsDefine = 'Must provide params';
const noStateDefined = 'Must specify state in params';
const noDistrictDefined = 'Must specify district in params';
const noBillIdDefined = 'Must specify bill Id in params';
const noRangeDefined = 'Must specify range in params';
const noRangesDefined = 'Must specify ranges in params';
const async = require('async');

/**
 * Helper method to add row data to gender breakdown.
 */
function setResult(row, breakdown) {
  breakdown[row.gender][row.votes] += row['COUNT(vote)'];
  breakdown[row.gender].total += row['COUNT(vote)'];
}

/**
 * Helper method to validate params.
 */
function checkParams(params, callback) {
  const logger = LogManager.get('Count::checkParams');
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
  callback(null);
}

/**
 * Helper method to populate sql statement.
 */
function populateStatement(options, params) {
  return `SELECT gender,
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
}

/**
 * Helper method to create a breakdown model.
 */
function getBreakdown(params) {
  return {
    minAge: params.range.min,
    maxAge: params.range.max,
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
}

/**
 * Implementation to retreive a gender breakdown of votes for a given bill, state, district and age range.
 */
function getGenderBreakdownForAgeRange(options, params, callback) {
  const logger = LogManager.get('Count::getGenderBreakdownForAgeRange');
  checkParams(params, (e) => {
    if (e) {
      return callback(e);
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

      const statement = populateStatement(options, params);
      const preparedParams = [params.state, params.district, params.billId];
      connection.execute(statement, preparedParams, (err, result) => {
        connection.release();
        const breakdown = getBreakdown(params);
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
  });
}

/**
 * Private helper method to generate a range object from a result
 */
function constructBreakDownFromResult(result, gender) {
  const r = result || {};
  return {
    minAge: r.minAge || 0,
    maxAge: r.maxAge || 0,
    votes: r[gender] || {
      total: 0,
      yes: 0,
      no: 0,
    },
  };
}

/**
 * Private helper method to generate a breakdown from a resultset.
 */
function constructBreakDownFromResults(results) {
  const resultset = {
    male: {
      ranges: [],
    },
    female: {
      ranges: [],
    },
    they: {
      ranges: [],
    },
  };
  results.forEach((res) => {
    resultset.male.ranges.push(constructBreakDownFromResult(res, 'male'));
    resultset.female.ranges.push(constructBreakDownFromResult(res, 'female'));
    resultset.they.ranges.push(constructBreakDownFromResult(res, 'they'));
  });
  return resultset;
}

/**
 * Implementation for retreiving multiple age ranges for a given billId, state and district.  Maps into the expected response defined in the readme for ranges on a gender.
 */
function getGenderBreakdownForAgeRanges(options, params, callback) {
  const logger = LogManager.get('Count::getGenderBreakdownForAgeRanges');
  checkParams(params, (err) => {
    if (err) {
      return callback(err);
    }
    if (!params.ranges) {
      return callback(new Error(noRangesDefined));
    }
    async.map(params.ranges, (range, mapCallback) => {
      const genderParams = {
        billId: params.billId,
        state: params.state,
        district: params.district,
        range: range,
      };
      getGenderBreakdownForAgeRange(options, genderParams, mapCallback);
    }, (error, result) => {
      if (error) {
        logger.error('GenderBreakDownError', error.message, error.stack);
      }
      const genderAgeBreakdown = constructBreakDownFromResults(result);
      callback(null, genderAgeBreakdown);
    });
  });
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
