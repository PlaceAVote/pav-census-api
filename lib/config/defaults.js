const mysql = require('mysql');
const winston = require('winston');
const config = require('./config.js');

const defaults = {
  connection: () => {
    const conn = mysql.createConnection(config.population.connection);
    return conn;
  },
  logger: () => {
    const loggers = {};
    return {
      get: (tag) => {
        const log = loggers[tag];
        if (log) {
          return log;
        }
        winston.loggers.add(tag, {
          console: {
            colorize: true,
            label: tag,
          },
        });
        const logger = winston.loggers.get(tag);
        loggers[tag] = logger;
        return logger;
      },
    };
  },
};

module.exports = defaults;
