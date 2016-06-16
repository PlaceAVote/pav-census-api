'use strict';
const async = require('async');
const LogManager = require('../logger/logger.js')();
const malformedRequest = 'Invalid Request';
const noBillIdWarning = 'Request receieved with no billId';
const internalServerError = 'Internal Server Error';
const cacheErrorMessage = 'There was an error saving the data to the cache';

/**
 * Private function to handle with internal server errors.
 */
function returnError(err, res, query) {
  const logger = LogManager.get('DistrictLeagueController::handleLeagueRequest');
  logger.error(`An Error occured while handeling district league request for billId ${query.billId}: ${err.message}`);
  res.statusCode = 500;
  return res.send({ message: internalServerError });
}


/**
 * Private function to populate the state and district with population data.
 */
function populateStateWithPopulation(options, state, callback) {
  // Get population for district.
  options.populationLoader.byDistrict(state, (populationErr, districtResult) => {
    if (populationErr) {
      return callback(populationErr);
    }
    // Add population data to response.
    const populateInt = parseInt(districtResult, 10);
    state.population = populateInt;
    state.sampleSize = options.sampler.population({ population: populateInt });
    return callback(null, state);
  });
}

/**
 * Private function to deal with the response to the http response.
 */
function returnResponse(options, key, err, res, query, results, populatedData) {
  const logger = LogManager.get('DistrictLeagueController::handleLeagueRequest');
  if (err) {
    return returnError(err, res, query);
  }
  // Set data in Cache.
  results.league = populatedData;
  options.cache.set({ key: key, body: results }, (cacheError) => {
    if (cacheError) {
      logger.warn(`${cacheErrorMessage}: ${cacheError.message}`);
    }
    // return the results.
    return res.send(results);
  });
}

/**
 * Handles the requests to Fetch the District League Data.
 *
 * @param options (object) - injected properties.
 * @param req (object) - The HTTP request.
 * @param res (object) - The HTTP response.
 */
function handleLeagueRequest(options, req, res) {
  const logger = LogManager.get('DistrictLeagueController::handleLeagueRequest');
  // Validate Request.
  const query = req.query;
  if (!query.billId) {
    logger.warn(noBillIdWarning);
    res.statusCode = 400;
    return res.send({ message: malformedRequest });
  }
  const key = `${query.billId}-districtleague`;
  // Check cache for data.
  options.cache.get(key, (cachedResult) => {
    if (cachedResult) {
      return res.send(cachedResult);
    }
    // Load data from datastore.
    options.dataLoader.getLeague(query, (err, results) => {
      if (err) {
        return returnError(err, res, query);
      }
      // Retreive data for each states population.
      async.map(results.league, (state, populationCallback) => {
        // Populate each state/district with population data.
        populateStateWithPopulation(options, state, populationCallback);
      }, (populationErr, populatedData) => {
        // Return the response to the client.
        return returnResponse(options, key, populationErr, res, query, results, populatedData);
      });
    });
  });
}
/**
 * Entry point for District League endpoint
 * @return {Object} returns a DistrictLeague controller object.
 */
const districtLeagueController = (options) => {
  return {
    handleLeagueRequest: (req, res) => {
      handleLeagueRequest(options, req, res);
    },
  };
};

module.exports = districtLeagueController;
