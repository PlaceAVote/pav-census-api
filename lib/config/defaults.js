const mysql = require('mysql2');
const winston = require('winston');
const config = require('./config.js');
const redis = require('redis');

const defaults = {
  cache: (options) => {
    const cacheConfig = options || config.cache;
    return redis.createClient(cacheConfig);
  },
  census: (options) => {
    const dbConnectionConfig = options || config.population.connection;
    return mysql.createPool(dbConnectionConfig);
  },
  user: (options) => {
    const dbConnectionConfig = options || config.user.connection;
    return mysql.createPool(dbConnectionConfig);
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
