const express = require('express');
const applicationLogger = require('morgan');
const routes = require('./routes');
const app = express();
const config = require('./lib/config/config.js');
const defaults = require('./lib/config/defaults.js');
const population = require('./lib/data/population.js');
const bill = require('./lib/controllers/bill.js');
const port = process.env.PORT || 1011;
const logger = defaults.logger().get('Application::Container');


logger.info('Initialising Data Readers');
const populationOptions = {
  connection: defaults.connection(),
  table: config.population.table,
};

const populationDataReader = population(populationOptions);

logger.info('Initialising Controllers');
const billController = bill({ populationDataReader: populationDataReader });

logger.info('Initialising Server');
app.use(applicationLogger('combined'));
app.get(routes.bill, (req, response) => {
  billController.getCensusData(req, response);
});

app.listen(port, () => {
  logger.info(`Sever initialised on ports ${port}`);
});
