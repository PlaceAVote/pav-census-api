const noStateDefined = 'No State Defined';
const noDistrictDefined = 'No District Defined';
const male = 'M';
const female = 'F';

function sexByStateAndDistrict(options, params, callback) {
  if (!params.state) {
    return callback(new Error(noStateDefined), null);
  }
  if (!params.district) {
    return callback(new Error(noDistrictDefined), null);
  }
  const select = `SELECT COUNT(vote) SELECT dob FROM ${options.votes} INNER JOIN ${options.info} ON user_id WHERE state = '${params.state}' AND district = ${params.district} AND gender = '${params.sex}'`;
  options.connection.query(select, () => {
    // TODO map results to age groups and
    // count (per group) as well as total count
    callback(null);
  });
}

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
