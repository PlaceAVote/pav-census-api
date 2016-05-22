const express = require('express');
const applicationLogger = require('morgan');
const routes = require('./routes');
const sampler = require('sample-population');
const app = express();
const config = require('./lib/config/config.js');
const defaults = require('./lib/config/defaults.js');
const population = require('./lib/data/population.js');
const count = require('./lib/data/count.js');
const bill = require('./lib/controllers/bill.js');
const port = process.env.PORT || 5000;
const logger = defaults.logger().get('Application::Container');


logger.info('Initialising Data Readers');
const populationOptions = {
  connection: defaults.census(),
  table: config.population.table,
};
const populationDataReader = population(populationOptions);

const userOptions = {
  connection: defaults.user(),
  votes: config.user.votes,
  info: config.user.info,
};
const countDataReader = count(userOptions);

logger.info('Initialising Controllers');
const billController = bill({
  populationDataReader: populationDataReader,
  countDataReader: countDataReader,
  sampler: sampler,
});

logger.info('Initialising Server');
app.use(applicationLogger('combined'));
app.get(routes.bill, (req, response) => {
  billController.getCensusData(req, response);
});

app.get(routes.health, (req, response) => {
  response.sendStatus(200);
});

app.listen(port, () => {
  logger.info(`Sever initialised on ports ${port}`);
});
