const express = require('express');
const applicationLogger = require('morgan');
const routes = require('./routes');
const sampler = require('sample-population');
const sqlinjection = require('sql-injection');
const app = express();
const defaults = require('./defaults/defaults.js');
const population = require('./lib/data/population.js');
const cache = require('./lib/cache/redis_cache.js');
const count = require('./lib/data/count.js');
const bill = require('./lib/controllers/bill.js');
const port = process.env.PORT || 5000;
const logger = defaults.logger().get('Application::Container');

logger.info('Reading Environment Variables');

const connection = {
  host: process.env.CONNECTION_HOST,
  user: process.env.CONNECTION_USER,
  password: process.env.CONNECTION_PASSWORD,
  database: process.env.CONNECTION_DB,
  connectionLimit: process.env.CONNECTION_POOL,
};

const censusDBConfig = {
  table: process.env.CENSUS_DATA,
  connection: connection,
};
const userDBConfig = {
  votes: process.env.VOTES_DATA,
  info: process.env.INFO_DATA,
  connection: connection,
};

const cacheConnection = {
  url: process.env.DEMOGRAPHIC_CACHE,
};

const required = [
  connection.host,
  connection.user,
  connection.password,
  connection.database,
  connection.connectionLimit,
  censusDBConfig.table,
  userDBConfig.votes,
  userDBConfig.info,
];

required.forEach((setting) => {
  if (!setting) {
    logger.error('Can not aquire all settings.  Terminating');
    process.exit(1);
  }
});

logger.info('Initialising Data Readers');
const populationOptions = {
  pool: defaults.census(censusDBConfig.connection),
  table: censusDBConfig.table,
};
const populationDataReader = population(populationOptions);

const userOptions = {
  pool: defaults.user(userDBConfig.connection),
  votes: userDBConfig.votes,
  info: userDBConfig.info,
};
const countDataReader = count(userOptions);

logger.info('Initialising Cache');
const resultsCache = defaults.cache(cacheConnection);

logger.info('Initialising Controllers');
const billController = bill({
  populationDataReader: populationDataReader,
  countDataReader: countDataReader,
  sampler: sampler,
  cache: cache({ client: resultsCache }),
});

logger.info('Initialising Server');

app.use(sqlinjection);
app.use(applicationLogger('combined'));

const cors = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
};

app.use(cors);
app.get(routes.bill, (req, response) => {
  billController.getCensusData(req, response);
});

app.get(routes.health, (req, response) => {
  response.sendStatus(200);
});

app.listen(port, () => {
  logger.info(`Sever initialised on ports ${port}`);
});
