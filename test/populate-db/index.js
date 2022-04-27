const utils = require('./utils');
const models = require('./model');
const db = require('../../src/models');
const Simulation = db.simulations;

const start = async () => {
  await models.connectMongo();
  const duties = [];
  const batteryLevels = [0, 2.2, 2.55, 2.78, 2.85, 2.92, 3.06, 3.15, 3.28, 3.5, 3.62, 3.75, 3.97, 4.1];
  const phIrr = [];
  const nonStoredInputs = [];
  for (let crazyParameter = 50; crazyParameter <= 1000; crazyParameter += 50)
    phIrr.push(crazyParameter);
  for (let duty = 0; duty <= 100; duty += 5) duties.push(duty);
  for (let duty of duties)
    for (let batteryLevel of batteryLevels) {
      try {
        //let isStored = await checkSimulation(duty, batteryLevel);
        // if (isStored) console.log(`Not stored: ${duty} - ${batteryLevel}`);
        await saveSimulation(duty, batteryLevel);
      } catch (err) {
        console.error(err);
      }
    }
  console.log(nonStoredInputs);
};

const saveSimulation = async (duty, batteryLevel) => {
  const input = utils.createInput(duty, batteryLevel);
  const simulationId = await utils.postSimulation(input);
  const simulation = await utils.getSimulationResult(simulationId);
  console.log('Simulation ended, hashing it and storing in db');
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
