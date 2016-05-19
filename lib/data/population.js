'use strict';
const defaults = require('../config/defaults.js');
const LogManager = defaults.logger();
const NoStateError = 'No State Defined';
const NoDistrictDefined = 'No District Defined';

/**
 * Given a state and district return the some of population data.
 * @param {options, state, district, callback}
 * Gets the Population Data based on The State & District.
 * @return {err, int} Returns an Error and Int in callback.
 */
function byDistrict(options, state, district, callback) {
  const logger = LogManager.get('Population::byDistrict');
  if (!state) {
    logger.warn(NoStateError);
    return callback(new Error(NoStateError), null);
  }
  if (!district) {
    logger.warn(NoDistrictDefined);
    return callback(new Error(NoDistrictDefined), null);
  }
  const select = `SELECT population FROM ${options.table} WHERE state = '${state}' AND district = ${district}`;
  options.connection.query(select, (err, rows) => {
    if (err) {
      logger.error(`SQL Query Error ${err.message} ${err.stack}`);
      return callback(err, null);
    }

    let population = 0;
    if (!rows) {
      logger.info(`No row results returned from query ${select}`);
      return callback(null, population);
    }
    rows.forEach((row) => {
      population += row.population;
    });
    return callback(null, population);
  });
}

/**
 * Used to get population data.
 * @param {Object} options.
 * @returns {Object} the population data interface.
 */
const population = (options) => {
  return {
    byDistrict: (params, callback) => {
      return byDistrict(options, params.state, params.district, callback);
    },
  };
};

module.exports = population;
