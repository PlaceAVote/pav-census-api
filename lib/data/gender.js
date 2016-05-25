const LogManager = require('../logger/logger.js')();
const noStateDefined = 'No State Defined';
const noDistrictDefined = 'No District Defined';
const noBillIdDefined = 'No Bill ID Defined';
const male = 'Male';
const female = 'Female';

/**
 * Given a state, district, billId and sex in the params hash
 * return the some of population data.
 * @param {options, params, callback}
 * Gets the gender breakdown based on The state & district for a bill.
 * @return {err, int} Returns an Error and Int in callback.
 */
function sexByStateAndDistrict(options, params, callback) {
  const logger = LogManager.get('Gender::sexByStateAndDistrict');
  if (!params.state) {
    logger.warn(noStateDefined);
    return callback(new Error(noStateDefined), null);
  }
  if (!params.district) {
    logger.warn(noDistrictDefined);
    return callback(new Error(noDistrictDefined), null);
  }
  if (!params.billId) {
    logger.warn(noBillIdDefined);
    return callback(new Error(noBillIdDefined), null);
  }
  const selectCount = `SELECT COUNT(${options.votes}.vote)`;
  const selectDOBs = `SELECT ${options.info}.dob`;
  const fromClause = `FROM ${options.votes} INNER JOIN ${options.info} ON ${options.votes}.user_id WHERE state='${params.state}' AND ${options.info}.district=${params.district} AND ${options.info}.gender='${params.sex}' AND ${options.votes}.bill_id='${params.billId}'`;
  const select = `SELECT (${selectCount} ${fromClause}) AS maleVoteCount, (${selectDOBs} ${fromClause}) AS dobList`;
  options.connection.query(select, (err, res) => {
    // TODO @histoiredebabar: map results to age groups and
    // count (per group) as well as total count
    callback(err, res);
  });
}

/**
 * Defines the gender data layer API.
 * Options must have a DB connection.
 */
const gender = (options) => {
  return {
    maleByStateAndDistrict: (params, callback) => {
      params.sex = male;
      return sexByStateAndDistrict(options, params, callback);
    },
    femaleByStateAndDistrict: (params, callback) => {
      params.sex = female;
      return sexByStateAndDistrict(options, params, callback);
    },
  };
};

module.exports = gender;
