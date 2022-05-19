const hash = require('object-hash');

const logger = require('../config/log');
const db = require('../models');
const Simulation = db.simulations;
const drHarvesterClient = require('../client/drHarvester.client');
const hasher = require('../utils/hasher');
const recordFile = require('../utils/recordDataPoint');
exports.simulationPost = async (req, res) => {
  if (!req.body.devId) {
    res.status(400).send({ message: 'Content can not be empty!' });
    return;
  }



  try {
    const { isCache, experimentName, devId, ...simulation } = req.body;
    simulation.phIrr = Math.round(simulation.batSOC / 50) * 50;;
    simulation.batSOC = Math.round(simulation.batSOC / 5) * 5;
    //const simulation = req.body;
    const job = {
      jobId: hash(Math.random()) + 'first',
    };

    if (!(await isCached(hash(simulation)))) {
      logger.info(`Simulation not found in cache. Querying DrHarvester...`);
      await storeFirst(req.body);
      storeSimulation(req.body, job.jobId);
      //console.log('++++++++++++++++++' + experimentName + '++++++++++++++++++');
      if (experimentName) recordFile(experimentName, 0);
      res.status(200).send(job);
    } else {
      logger.info('simulation found: ' + hash(simulation));
      if (experimentName) recordFile(experimentName, 1);
      const response = {
        jobId: hash(simulation),
      };
      res.status(200).send(response);
    }
  } catch (err) {
    res.status(503).send({ error: err });
  }
};

exports.simulationGet = async (req, res) => {
  const id = req.params.id;
  try {
    logger.info(`searching id: ${id}`);
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

const mockSimulation = {
  result: {
    devId: 'shm',
    harvId: 'SolarHeavyLoad',
    batState: 0,
    batlifeh: 0,
    tChargeh: -1,
    dSOCrate: -0.938,
    date: '19-Apr-2022 23:41:47',
    simStatus: 0,
  },
  terminated: true,
};

const storeFirst = async (inputData) => {
  logger.info('storing mock simulation');
  try {
    const { isCache, experimentName, ...input } = inputData;
    const hashedData = await hasher(hash(input), mockSimulation);
    const simulationSchema = new Simulation(hashedData);
    await simulationSchema.save(simulationSchema);
  } catch (error) {
    logger.error('DB Error ');
    logger.error(error);
  }
};

//TODO: move this to another file
const storeSimulation = async (input, hash) => {
  //console.log(input);
  try {
    const simulationId = await drHarvesterClient.postSimulation(input, hash);
    const simulation = await drHarvesterClient.getSimulationResult(simulationId, input.isCache);
    logger.info('Simulation ended, hashing it and storing in db, hash: ' + hash);
    const hashedData = await hasher(hash, simulation);
    const simulationSchema = new Simulation(hashedData);
    await simulationSchema.save(simulationSchema);
  } catch (error) {
    logger.error('DrHarvester Error ');
    logger.error(error);
    process.exit();
  }
};

const isCached = async (id) => Simulation.findById(id);
