const winston = require('winston');

const logger = () => {
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
      const l = winston.loggers.get(tag);
      loggers[tag] = l;
      return l;
    },
  };
};

module.exports = logger;
