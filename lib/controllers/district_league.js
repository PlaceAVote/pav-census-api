'use strict';
const LogManager = require('../logger/logger.js')();
const malformedRequest = 'Invalid Request';
const noBillIdWarning = 'Request receieved with no billId';
const internalServerError = 'Internal Server Error';
const cacheErrorMessage = 'There was an error saving the data to the cache';

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
        logger.error(`An Error occured while handeling district league request for billId ${query.billId}: ${err.message}`);
        res.statusCode = 500;
        return res.send({ message: internalServerError });
      }
      // Set data in Cache
      options.cache.set({ key: key, body: results }, (cacheError) => {
        if (cacheError) {
          logger.warn(`${cacheErrorMessage}: ${cacheError.message}`);
        }
        // return the results.
        return res.send(results);
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
