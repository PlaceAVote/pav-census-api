const mysql = require('mysql2');
const winston = require('winston');
const redis = require('redis');

const defaults = {
  cache: (connection) => {
    return redis.createClient(connection);
  },
  pool: (connection) => {
    return mysql.createPool(connection);
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
