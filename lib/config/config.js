const config = {
  //  Will be set in Environment Variables on deployment
  //  instead of in this config file.
  population: {
    table: 'analytics.census_data',
    connection: {
      host: 'pav-production-data.cohs9sc8kicp.us-west-2.rds.amazonaws.com',
      user: 'analytics_access',
      password: 'L%z46?PQQj7ZFR5j',
    },
  },
};

module.exports = config;
