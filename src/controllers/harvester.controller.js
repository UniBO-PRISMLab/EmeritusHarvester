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
    } else {
      console.log('simulation found ' + job.jobId);
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
      res.status(404).send({
        message: `Simulation ${id} not found`,
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
  console.log(input);
  try {
    /*  let simulation;
    if (input.activeI === 715) {
      console.log('ANALYTICAL SIMULATION');
      simulation = await calculateSimulation(input.duty, input.batV);
      console.log('simulation calculated:');
      console.log(simulation);
    } else { */
    const simulationId = await drHarvesterClient.postSimulation(input);
    const simulation = await drHarvesterClient.getSimulationResult(simulationId);
    //}
    logger.info('Simulation ended, hashing it and storing in db');
    const hashedData = await hasher(input, simulation);
    const simulationSchema = new Simulation(hashedData);
    console.log(simulationSchema);
    await simulationSchema.save(simulationSchema);
  } catch (error) {
    console.log('DrHarvester Error ');
  }
};

const calculateBatteryyLifetime = (duty, batteryLevel) => {
  console.log(`duty: ${duty}, bat: ${batteryLevel}`);
  let batSOC = (0.6279 * batteryLevel - 1.548) * 100;
  if (batSOC > 100) batSOC = 100;
  else if (batSOC < 0) batSOC = 0;

  const misteriousData = -0.424 * 700 + (648 + 5.8 * duty);

  const batlifeh = (3250 * (batSOC / 100)) / Math.abs(misteriousData);
  console.log(`duty: ${duty}, bat: ${duty} batlifeh ${batlifeh}`);

  return batlifeh;
};

const calculateSimulation = async (duty, batteryLevel) => {
  const simulation = {
    terminated: true,
    result: {
      devId: 'fake',
      harvId: 'SolarHeavyLoad',
      batState: 0,
      batlifeh: await calculateBatteryyLifetime(duty, batteryLevel),
      tChargeh: -1,
      dSOCrate: -0.938,
      date: '19-Apr-2022 23:41:47',
      simStatus: 0,
    },
  };
  return simulation;
};

const isCached = async (id) => Simulation.findById(id);
