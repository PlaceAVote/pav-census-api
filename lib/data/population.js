/* eslint-disable */
'use strict';
/* eslint-enable */
const NoStateError = 'No State Defined';
const NoDistrictDefined = 'No District Defined';

/**
 * Given a state and district return the some of population data.
 * @param {options, state, district, callback}
 * Gets the Population Data based on The State & District.
 * @return {err, int} Returns an Error and Int in callback.
 */
function byDistrict(options, state, district, callback) {
  if (!state) {
    return callback(new Error(NoStateError), null);
  }
  if (!district) {
    return callback(new Error(NoDistrictDefined), null);
  }
  const select = `SELECT population FROM ${options.table} WHERE state = '${state}' AND district = ${district}`;
  options.connection.connect();
  options.connection.query(select, (err, rows) => {
    if (err) {
      return callback(err, null);
    }

    let population = 0;
    if (!rows) {
      return callback(null, population);
    }
    rows.forEach((row) => {
      population += row.population;
    });

    return callback(null, population);
  });
  options.connection.end();
}

/**
 * Used to get population data.
 * @param {Object} options.
 * @returns {Object} the population data interface.
 */
const population = (options) => {
  return {
    byDistrict: (state, district, callback) => {
      return byDistrict(options, state, district, callback);
    },
  };
};

module.exports = population;
