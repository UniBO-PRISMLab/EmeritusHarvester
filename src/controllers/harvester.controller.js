const hash = require('object-hash');

const logger = require('../config/log');
const db = require('../models');
const Simulation = db.simulations;
const drHarvesterClient = require('../client/drHarvester.client');
const hasher = require('../utils/hasher');

exports.simulationPost = async (req, res) => {
  if (!req.body.devId) {
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
    if (!mongoResponse)
      res.status(404).send({
        message: `Simulation ${id} not found`,
      });
    else res.status(200).send(mongoResponse);
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
    const simulation = await drHarvesterClient.getSimulationResult(simulationId);
    logger.info('Simulation ended, hashing it and storing in db');
    const hashedData = await hasher(input, simulation);
    const simulationSchema = new Simulation(hashedData);
    console.log(simulationSchema);
    await simulationSchema.save(simulationSchema);
  } catch (error) {
    console.log('DrHarvester Error ');
  }
};

const isCached = async (id) => Simulation.findById(id);
