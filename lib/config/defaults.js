const mysql = require('mysql');
const winston = require('winston');
const config = require('./config.js');

const defaults = {
  connection: () => {
    const conn = mysql.createConnection(config.population.connection);
    conn.connect();
    return conn;
  },
  logger: () => {
    return winston;
  },
};

module.exports = defaults;
