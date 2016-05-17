const mysql = require('mysql');
const config = require('./config.js');

const defaults = {
  connection: () => {
    return mysql.createConnection(config.population.connection);
  },
};

module.exports = defaults;
