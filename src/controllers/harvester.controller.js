const hash = require('object-hash');

const logger = require('../config/log');
const db = require('../models');
const Simulation = db.simulations;
const drHarvesterClient = require('../client/drHarvester.client');
const hasher = require('../utils/hasher');
const recordFile = require('../utils/recordDataPoint');
exports.simulationPost = async (req, res) => {
  if (!req.body.harvId) {
    res.status(400).send({ message: 'Content can not be empty!' });
    return;
  }

  try {
    const { devId, ...simulation } = req.body;
    const job = {
      jobId: hash(simulation),
    };

    if (!(await isCached(job.jobId))) {
      logger.info(`Simulation not found in cache. Querying DrHarvester...`);
      storeSimulation(req.body);
      console.log(simulation);
      if (simulation.experimentName) recordFile(simulation.experimentName, 0);
    } else {
      logger.info('simulation found: ' + job.jobId);
      if (simulation.experimentName) recordFile(simulation.experimentName, 1);
    }
    res.status(200).send(job);
  } catch (err) {
    res.status(503).send({ error: err });
  }
};

exports.simulationGet = async (req, res) => {
  const id = req.params.id;
  try {
    const mongoResponse = await Simulation.findById(id);
    if (!mongoResponse) {
      res.status(200).send({
        terminated: false,
        result: null,
      });
    } else {
      //console.log('mongo response');
      //if (mongoResponse) console.log(mongoResponse);
      res.status(200).send(mongoResponse);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      message: `Error retriving simulation ${id}`,
    });
  }
};

//TODO: move this to another file
const storeSimulation = async (input) => {
  try {
    const simulationId = await drHarvesterClient.postSimulation(input);
    const simulation = await drHarvesterClient.getSimulationResult(simulationId, input.isCache);
    logger.info('Simulation ended, hashing it and storing in db');
    const hashedData = await hasher(input, simulation);
    const simulationSchema = new Simulation(hashedData);
    await simulationSchema.save(simulationSchema);
  } catch (error) {
    logger.error('DrHarvester Error ');
    logger.error(error);
  }
};

const isCached = async (id) => Simulation.findById(id);
