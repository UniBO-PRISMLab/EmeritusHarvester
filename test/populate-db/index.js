const utils = require('./utils');
const models = require('./model');
const db = require('../../src/models');
const Simulation = db.simulations;
const sensorType = process.env.SENSOR_TYPE;
console.log(sensorType);

const start = async () => {
  await models.connectMongo();
  const duties = [];
  let batteryLevels = []; //

  const phIrr = [];
  for (let crazyParameter = 0; crazyParameter <= 1000; crazyParameter += 50)
    phIrr.push(crazyParameter);
  if (sensorType === 'gas') for (let duty = 10; duty <= 50; duty += 1) duties.push(duty);
  if (sensorType === 'shm') for (let duty = 0; duty <= 100; duty += 10) duties.push(duty);
  for (let battery = 200; battery <= 410; battery += 1) batteryLevels.push(battery / 100);
  for (let batteryLevel of batteryLevels) {
    for (let duty of duties)
      for (let irr of phIrr)
        try {
          //let isStored = await checkSimulation(duty, batteryLevel);
          // if (isStored) console.log(`Not stored: ${duty} - ${batteryLevel}`);
          await fillDataBaseWithEstimatedValues(duty, batteryLevel, irr);
        } catch (err) {
          console.error(err);
        }
  }
};

const calculateSimulationGas = (duty, batteryLevel, irr = 700) => {
  console.log('------------ GAS ------------');
  console.log(`duty: ${duty}, bat: ${batteryLevel}`);
  let batSOC = 90; //(0.6279 * batteryLevel - 1.548) * 100;
  if (batSOC > 100) batSOC = 100;
  else if (batSOC < 0) batSOC = 0;
  //0.389 * phIrr[W/m2] - (5.068 + 0.078* duty[%])
  let battery = {
    batlifeh: -1,
    tChargeh: -1,
  };
  const misteriousData = 0.0389 * irr - (5.068 + 0.078 * duty);
  console.log(misteriousData);
  if (misteriousData >= 0) {
    battery.tChargeh = (1000 * (1 - batSOC / 100)) / Math.abs(misteriousData);
  } else {
    battery.batlifeh = (1000 * (batSOC / 100)) / Math.abs(misteriousData);
  }
  console.log(
    `duty: ${duty}, bat: ${duty}, irr: ${irr}, batlifeh ${battery.batlifeh} charge:${battery.tChargeh}`
  );
  if (duty == 0) battery.batlifeh *= 1.1;
  return battery;
};

const calculateSimulation = (duty, batteryLevel, irr) => {
  let battery = {
    batlifeh: -1,
    tChargeh: -1,
  };
  console.log(`duty: ${duty}, bat: ${batteryLevel}`);
  let batSOC = (0.6279 * batteryLevel - 1.548) * 100;
  if (batSOC > 100) batSOC = 100;
  else if (batSOC < 0) batSOC = 0;

  const misteriousData = -0.424 * irr + (648 + 5.8 * duty);

  let batlifeh = (3250 * (batSOC / 100)) / Math.abs(misteriousData);
  console.log(`duty: ${duty}, bat: ${duty}, irr: ${irr}, batlifeh ${batlifeh}`);
  if (duty == 0) batlifeh *= 1.1;
  battery.batlifeh = batlifeh;
  return battery;
};

const fillDataBaseWithEstimatedValues = async (duty, batteryLevel, irr = 700) => {
  const input = utils.createInput(duty, batteryLevel, irr);
  const battery =
    sensorType === 'shm'
      ? calculateSimulation(duty, batteryLevel, irr)
      : calculateSimulationGas(duty, batteryLevel, irr);
  const simulation = {
    terminated: true,
    result: {
      devId: 'fake',
      harvId: 'SolarHeavyLoad',
      batState: 0,
      batlifeh: battery.batlifeh,
      tChargeh: battery.tChargeh,
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
  console.log(input);
  const simulationId = await utils.postSimulation(input);
  const simulation = await utils.getSimulationResult(simulationId);
  console.log('Simulation ended, hashing it and storing in db');
  console.log(simulation);
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
