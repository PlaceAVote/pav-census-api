'use strict';
const async = require('async');
const LogManager = require('../logger/logger.js')();
const malformedRequest = 'Invalid Request';
const internalServerError = 'An Internal Error Occurred';
const noResultsObjectError = 'No Results model was returned from the data reader.';
const ageRanges = [
  {
    min: 18,
    max: 30,
  },
  {
    min: 30,
    max: 45,
  },
  {
    min: 45,
    max: 60,
  },
  {
    min: 60,
    max: 120,
  },
];

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
    const resultInt = parseInt(result, 10);
    data.population = resultInt;
    callback(null);
  });
}

/**
 * Generate a key from a request.
 */
function generateKeyFromQuery(query) {
  return `${query.state}-${query.billId}-${query.district}`;
}

/**
 * Private wrapper function to generate a get a cached object.
 */
function setResultInCache(options, query, data, callback) {
  const logger = LogManager.get('BillController::setResultInCache');
  const key = generateKeyFromQuery(query);
  options.cache.set({ key: key, body: data }, (err) => {
    if (err) {
      logger.error(`Error Caching object for key ${key}, ${err.message}`);
    }
    callback(null);
  });
}

/**
 * Set the results to a specific range.
 */
function setRangePopulation(options, range, err, result, callback) {
  const logger = LogManager.get('BillController::setRangePopulation');
  if (err) {
    logger.error(err.message, err.stack);
    return callback(err);
  }
  const populationInt = parseInt(result, 10);
  range.population = populationInt;
  range.sampleSize = options.sampler.population({ population: populationInt });
  callback(null, range);
}

/**
 * Populate each range for a gender with population and sample size data.
 */
function populateGenderBreakdownSampleAndPopulation(options, query, data, gender, callback) {
  const logger = LogManager.get('BillController::populateGenderBreakdownSampleAndPopulation');
  async.map(data.gender[gender].ranges, (range, rangeCallback) => {
    const params = {
      state: query.state,
      district: query.district,
      gender: gender === 'male' ? 'M' : 'F',
      range: {
        lowAge: range.minAge,
        highAge: range.maxAge,
      },
    };
    options.populationDataReader.byDistrictGenderAndRange(params, (err, result) => {
      return setRangePopulation(options, range, err, result, rangeCallback);
    });
  }, (err, results) => {
    if (err) {
      logger.error(err.message, err.stack);
      return callback(err);
    }
    data.gender[gender].ranges = results;
    callback(null);
  });
}

/**
 * Private wrapper function to set the gender breakdown results.
 */
function setGenderBreakdownResults(options, query, data, callback) {
  const logger = LogManager.get('BillController::setGenderBreakdownResults');
  const search = {
    billId: query.billId,
    state: query.state,
    district: query.district,
    ranges: ageRanges,
  };
  options.genderBreakdownReader.getGenderBreakdownForAgeRanges(search, (err, result) => {
    if (err) {
      logger.error(`An Error Occured when getting gender breakdown data ${err.message} ${err.stack}`);
      return callback(err);
    }
    if (result && result.male && result.female && result.they) {
      data.gender.male.ranges = result.male.ranges;
      data.gender.female.ranges = result.female.ranges;
      data.gender.nonBinary.ranges = result.they.ranges;
    }
    async.parallel([
      (maleCallback) => {
        populateGenderBreakdownSampleAndPopulation(options, query, data, 'male', maleCallback);
      },
      (femaleCallback) => {
        populateGenderBreakdownSampleAndPopulation(options, query, data, 'female', femaleCallback);
      },
    ], (populationErr) => {
      if (populationErr) {
        return callback(populationErr);
      }
      callback(null);
    });
  });
}

/**
 * Sets a single genders population and sample size.
 */
function setPopulationAndSampleSizeForGender(dataReader, sampler, query, data, gender, callback) {
  const logger = LogManager.get('BillController::setGenderPopulationResults');
  const params = {
    state: query.state,
    district: query.district,
    gender: gender === 'male' ? 'M' : 'F',
  };
  dataReader.byDistrictAndGender(params, (err, result) => {
    if (err) {
      logger.error(`Error retreiving population data for ${gender}`, err.message, err.stack);
      return callback(err);
    }
    const resultInt = parseInt(result, 10);
    data.gender[gender].population = resultInt;
    data.gender[gender].sampleSize = sampler.population({ population: resultInt });
    callback(null);
  });
}

/**
 * Sets the population and sample size for each gender.
 */
function setGenderPopulation(dataReader, sampler, query, data, callback) {
  const logger = LogManager.get('BillController::setGenderPopulationResults');
  async.parallel([(maleCallback) => {
    setPopulationAndSampleSizeForGender(dataReader, sampler, query, data, 'male', maleCallback);
  }, (femaleCallback) => {
    setPopulationAndSampleSizeForGender(dataReader, sampler, query, data, 'female', femaleCallback);
  }], (err) => {
    if (err) {
      logger.error(err.message, err.stack);
      return callback(err);
    }
    callback(null);
  });
}

/**
 * Try to get the object first from the cache.
 */
function getResultFromCache(options, params, callback) {
  const key = generateKeyFromQuery(params);
  options.cache.get(key, (result) => {
    return callback(result);
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
  if (isNaN(query.district)) {
    logger.warn(`Receieved Invalid Request:: billId ${query.billId}, state ${query.state}, district ${query.district}`);
    res.statusCode = 400;
    return res.send({ message: malformedRequest });
  }

  getResultFromCache(options, query, (cachedResult) => {
    if (cachedResult) {
      return res.send(cachedResult);
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
      (genderPopulationBreakdownCallback) => {
        setGenderPopulation(options.populationDataReader, options.sampler, query, data, genderPopulationBreakdownCallback);
      },
      (genderCallback) => {
        setGenderBreakdownResults(options, query, data, genderCallback);
      },
    ],
    (err) => {
      if (err) {
        res.statusCode = 500;
        logger.error(internalServerError);
        return res.send({ message: internalServerError });
      }
      data.sampleSize = options.sampler.population(data);
      setResultInCache(options, query, data, () => {
        res.send(data);
      });
    });
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
