const utils = require('./utils');
const config = require('./config.json');
const models = require('./model');
const db = require('../../src/models');
const Simulation = db.simulations;

const start = async () => {
  await models.connectMongo();
  const duties = [];
  let batteryLevels = []; //

  const phIrr = [];
  const nonStoredInputs = [];
  /*   for (let crazyParameter = 50; crazyParameter <= 1000; crazyParameter += 50)
    phIrr.push(crazyParameter); */
  if (config.sensorType === 'gas') for (let duty = 10; duty <= 33; duty += 5) duties.push(duty);
  if (config.sensorType === 'shm') for (let duty = 1; duty <= 100; duty += 1) duties.push(duty);
  if (config.sensorType === 'shm')
    for (let battery = 200; battery <= 410; battery += 1) batteryLevels.push(battery / 100);
  if (config.sensorType === 'gas')
    batteryLevels = [
      2.2, 2.55, 2.78, 2.85, 2.92, 3.06, 3.15, 3.28, 3.5, 3.62, 3.75, 3.82, 3.97, 4.1,
    ];
  for (let batteryLevel of batteryLevels) {
    for (let duty of duties)
      try {
        //let isStored = await checkSimulation(duty, batteryLevel);
        // if (isStored) console.log(`Not stored: ${duty} - ${batteryLevel}`);
        if (config.sensorType === 'gas') await saveSimulation(duty, batteryLevel);
        if (config.sensorType === 'shm') await fillDataBaseWithEstimatedValues(duty, batteryLevel);
      } catch (err) {
        console.error(err);
      }
  }
  console.log(nonStoredInputs);
};

const calculateSimulation = (duty, batteryLevel) => {
  console.log(`duty: ${duty}, bat: ${batteryLevel}`);
  let batSOC = (0.6279 * batteryLevel - 1.548) * 100;
  if (batSOC > 100) batSOC = 100;
  else if (batSOC < 0) batSOC = 0;

  const misteriousData = -0.424 * 700 + (648 + 5.8 * duty);

  const batlifeh = (3250 * (batSOC / 100)) / Math.abs(misteriousData);
  console.log(`duty: ${duty}, bat: ${duty} batlifeh ${batlifeh}`);

  return batlifeh;
};

const fillDataBaseWithEstimatedValues = async (duty, batteryLevel) => {
  const input = utils.createInput(duty, batteryLevel);
  const simulation = {
    terminated: true,
    result: {
      devId: 'fake',
      harvId: 'SolarHeavyLoad',
      batState: 0,
      batlifeh: calculateSimulation(duty, batteryLevel),
      tChargeh: -1,
      dSOCrate: -0.938,
      date: '19-Apr-2022 23:41:47',
      simStatus: 0,
    },
  };
  const hashedData = await utils.hashData(input, simulation);
  const simulationSchema = new Simulation(hashedData);
  const mongoRes = await simulationSchema.save(simulationSchema);
  console.log('Data Stored in DB');
};

module.exports = calculateSimulation;
const saveSimulation = async (duty, batteryLevel) => {
  const input = utils.createInput(duty, batteryLevel);
  const simulationId = await utils.postSimulation(input);
  const simulation = await utils.getSimulationResult(simulationId);
  console.log('Simulation ended, hashing it and storing in db');
  console.log(`duty:${duty} - lifetime: ${simulation.result.batlifeh}`);
  const hashedData = await utils.hashData(input, simulation);
  const simulationSchema = new Simulation(hashedData);
  const mongoRes = await simulationSchema.save(simulationSchema);
  console.log('Data Stored in DB');
};
const hash = require('object-hash');

const checkSimulation = async (duty, batteryLevel) => {
  const input = utils.createInput(duty, batteryLevel);
  const { devId, ...hashableInput } = input;
  const _id = hash(hashableInput);
  const mongoResponse = getSimulation(input, _id);
  if (mongoResponse) return true;
  else return false;
};

const getSimulation = async (input, id) => {
  const mongoRes = await Simulation.findById(id);
  if (!mongoRes) return input;
  else return;
};

const mongoose = require('mongoose');

start()
  .then(() => {
    mongoose.disconnect();
  })
  .catch((err) => {
    mongoose.disconnect();
    console.error(err);
  });
