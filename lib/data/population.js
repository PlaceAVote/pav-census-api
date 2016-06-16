'use strict';
const LogManager = require('../logger/logger.js')();
const noStateError = 'No State Defined';
const noDistrictDefined = 'No District Defined';
const noGenderDefined = 'No Gender Defined';
const noRangeDefined = 'No Range Defined';
const SUM = 'SUM(population)';

/**
 * Private function to query the database and return a population
 * given a statement.
 */
function query(options, logger, statement, params, callback) {
  options.pool.getConnection((poolError, connection) => {
    if (poolError) {
      logger.error(poolError.message, poolError.stack);
      return callback(poolError);
    }
    connection.execute(statement, params, (err, rows) => {
      connection.release();
      if (err) {
        logger.error(`SQL Query Error ${err.message} ${err.stack}`);
        return callback(err, null);
      }

      let population = 0;
      if (!rows || rows.length === 0) {
        logger.info(`No row results returned from query ${statement}`);
        return callback(null, population);
      }
      population = rows[0][SUM] || 0;
      return callback(null, population);
    });
  });
}

/**
 * Given a state, district and gender and return the sum of population data.
 * @param {options, params, callback}
 * Gets the Population Data based on The State & District and Gender.
 * @return {err, int} Returns an Error and Int in callback.
 */
function byDistrictGenderAndRange(options, params, callback) {
  const logger = LogManager.get('Population::byDistrictAndGender');
  if (!params.state) {
    logger.warn(noStateError);
    return callback(new Error(noStateError), null);
  }
  if (!params.district) {
    logger.warn(noDistrictDefined);
    return callback(new Error(noDistrictDefined), null);
  }
  if (!params.gender) {
    logger.warn(noGenderDefined);
    return callback(new Error(noGenderDefined), null);
  }
  if (!params.range || !params.range.lowAge || !params.range.highAge) {
    logger.warn(noRangeDefined);
    return callback(new Error(noRangeDefined), null);
  }
  // The last age condition is owed to how the data over 80's is represented in the database.
  const select = `SELECT SUM(population) FROM ${options.table} WHERE state = ? AND district = ? AND gender = ? AND age_low >= ? AND age_high <= ? AND age_high > 0`;
  const preparedParams = [params.state, params.district, params.gender, params.range.lowAge, params.range.highAge];
  query(options, logger, select, preparedParams, callback);
}

/**
 * Given a state, district and gender and return the sum of population data.
 * @param {options, params, callback}
 * Gets the Population Data based on The State & District and Gender.
 * @return {err, int} Returns an Error and Int in callback.
 */
function byDistrictAndGender(options, params, callback) {
  const logger = LogManager.get('Population::byDistrictAndGender');
  if (!params.state) {
    logger.warn(noStateError);
    return callback(new Error(noStateError), null);
  }
  if (!params.district) {
    logger.warn(noDistrictDefined);
    return callback(new Error(noDistrictDefined), null);
  }
  if (!params.gender) {
    logger.warn(noGenderDefined);
    return callback(new Error(noGenderDefined), null);
  }
  const select = `SELECT SUM(population) FROM ${options.table} WHERE state = ? AND district = ? AND gender = ?`;
  const preparedParams = [params.state, params.district, params.gender];
  query(options, logger, select, preparedParams, callback);
}

/**
 * Given a state and district return the sum of population data.
 * @param {options, params, callback}
 * Gets the Population Data based on The State & District.
 * @return {err, int} Returns an Error and Int in callback.
 */
function byDistrict(options, params, callback) {
  const logger = LogManager.get('Population::byDistrict');
  if (!params.state) {
    logger.warn(noStateError);
    return callback(new Error(noStateError), null);
  }
  if (!params.district) {
    logger.warn(noDistrictDefined);
    return callback(new Error(noDistrictDefined), null);
  }
  const select = `SELECT SUM(population) FROM ${options.table} WHERE state = ? AND district = ?`;
  const preparedParams = [params.state, params.district];
  query(options, logger, select, preparedParams, callback);
}

/**
 * Used to get population data.
 * @param {Object} options.
 * @returns {Object} the population data interface.
 */
const population = (options) => {
  return {
    byDistrict: (params, callback) => {
      return byDistrict(options, params, callback);
    },
    byDistrictAndGender: (params, callback) => {
      return byDistrictAndGender(options, params, callback);
    },
    byDistrictGenderAndRange: (params, callback) => {
      return byDistrictGenderAndRange(options, params, callback);
    },
  };
};

module.exports = population;
