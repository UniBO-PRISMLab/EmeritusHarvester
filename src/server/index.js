const express = require('express');
const cors = require('cors');

const logger = require('../config/log');
const db = require('../models');
const gConfig = require('../config/conf.json');

const routesPath = '../routes';

const port = gConfig.emeritus.port || 3000;

const app = express();

const connectMongo = async () => {
  logger.info(`Connecting to MongoDB at ${db.url}`);

  try {
    await db.mongoose.connect(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connected to the database!');
  } catch (error) {
    logger.info({
      message: 'Cannot connect to the database',
      error: error,
    });
    process.exit();
  }
};

module.exports.start = async () => {
  await connectMongo();
  app.use(express.json());
  //Initialize routes
  app.use(
    cors({
      origin: '*',
    })
  );
  await require(routesPath)(app);
  //run server
  return await app.listen(port);
};
