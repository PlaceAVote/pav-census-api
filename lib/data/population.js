'use strict';
const defaults = require('../config/defaults.js');
const LogManager = defaults.logger();
const noStateError = 'No State Defined';
const noDistrictDefined = 'No District Defined';

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
  const select = `SELECT population FROM ${options.table} WHERE state = '${params.state}' AND district = ${params.district}`;
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
      return byDistrict(options, params, callback);
    },
  };
};

module.exports = population;
