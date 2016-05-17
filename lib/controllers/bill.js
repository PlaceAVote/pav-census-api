'use strict';
const async = require('async');
const defaults = require('../config/defaults.js');
const logger = defaults.logger();
const malformedRequest = 'Invalid Request';
const internalServerError = 'An Internal Error Occurred';

/**
 * Private wrapper function to isolate the population logic.
 * @param {dataReader, stats, district, data, callback}
 *  - datareader: Injected to read the population data.
 *  - state: The State to query.
 *  - district: The district to query.
 *  - data: shared data object to populate.
 *  - callback: @returns {err} returns an error if one occrurs else
 *    populates the data object.
 */
function setPopulationData(dataReader, state, district, data, callback) {
  dataReader.byDistrict(state, district, (err, result) => {
    if (err) {
      logger.error(`An Error Occured when getting population data ${err.stack}`);
      return callback(err);
    }
    data.population = result;
    callback(null);
  });
}

/**
 * Wrapper for getting the census data.
 * Deals with handling the response.
 */
function getCensusData(options, req, res) {
  const query = req.query;
  if (!query.billId || !query.state || !query.district) {
    logger.warn(`Receieved Invalid Request:: billId ${query.billId}, state ${query.state}, district ${query.district}`);
    res.statusCode = 400;
    return res.send({ message: malformedRequest });
  }
  const data = {};
  async.parallel([
    (populationCallback) => {
      setPopulationData(options.populationDataReader, query.state, query.district, data, populationCallback);
    },
  ],
  (err) => {
    if (err) {
      res.statusCode = 500;
      logger.error('In Internal Error happend when processing census data');
      return res.send({ message: internalServerError });
    }
    res.send(data);
  });
}

/**
 * Entry point for Bill  Census endpoints
 * @return {Object} returns a bill controller object.
 */
const billController = (options) => {
  return {
    getCensusData: (req, res) => {
      getCensusData(options, req, res);
    },
  };
};

module.exports = billController;
