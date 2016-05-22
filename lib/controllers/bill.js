'use strict';
const async = require('async');
const defaults = require('../config/defaults.js');
const LogManager = defaults.logger();
const malformedRequest = 'Invalid Request';
const internalServerError = 'An Internal Error Occurred';
const noResultsObjectError = 'No Results model was returned from the data reader.';


/**
 * convenience function to return a shared
 * votes schema with default values.
 */
function generateVotes(total, yes, no) {
  return {
    yes: yes || 0,
    no: no || 0,
    total: total || 0,
  };
}

/**
 * Private wrapper function to isolate populating the counted vote data.
 * @param {dataReader, query, data, callback}
 *  - datareader: Injected to read the population data.
 *  - query:
 *    - state: The State to query.
 *    - district: The district to query.
 *    - billId: The billId to query.
 *  - data: shared data object to populate.
 *  - callback: @returns {err} returns an error if one occrurs else
 *    populates the data object.
 */
function setDemographicVoteCounts(dataReader, query, data, callback) {
  const logger = LogManager.get('BillController::setCountData');
  dataReader.byDistrict(query, (err, result) => {
    if (err) {
      logger.error(`An Error Occured when getting population data ${err.message} ${err.stack}`);
      return callback(err);
    }
    if (!result) {
      logger.warn(noResultsObjectError);
      result = {};
    }
    data.votes = generateVotes(result.total, result.yes, result.no);
    data.gender.male.votes = generateVotes(result.male, result.maleYes, result.maleNo);
    data.gender.female.votes = generateVotes(result.female, result.femaleYes, result.femaleNo);
    data.gender.nonBinary.votes = generateVotes(result.nonBinary, result.nonBinaryYes, result.nonBinaryNo);
    callback(null);
  });
}

/**
 * Private wrapper function to isolate the population logic.
 * @param {dataReader, query, data, callback}
 *  - datareader: Injected to read the population data.
 *  - query:
 *    - state: The State to query.
 *    - district: The district to query.
 *  - data: shared data object to populate.
 *  - callback: @returns {err} returns an error if one occrurs else
 *    populates the data object.
 */
function getPopulationData(dataReader, query, data, callback) {
  const logger = LogManager.get('BillController::setPopulationData');
  dataReader.byDistrict(query, (err, result) => {
    if (err) {
      logger.error(`An Error Occured when getting population data ${err.message} ${err.stack}`);
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
  const logger = LogManager.get('BillController::getCensusData');
  const query = req.query;
  if (!query.billId || !query.state || !query.district) {
    logger.warn(`Receieved Invalid Request:: billId ${query.billId}, state ${query.state}, district ${query.district}`);
    res.statusCode = 400;
    return res.send({ message: malformedRequest });
  }
  const data = {
    gender: {
      male: {},
      female: {},
      nonBinary: {},
    },
  };
  async.parallel([
    (populationCallback) => {
      getPopulationData(options.populationDataReader, query, data, populationCallback);
    },
    (countCallback) => {
      setDemographicVoteCounts(options.countDataReader, query, data, countCallback);
    },
  ],
  (err) => {
    if (err) {
      res.statusCode = 500;
      logger.error(internalServerError);
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
