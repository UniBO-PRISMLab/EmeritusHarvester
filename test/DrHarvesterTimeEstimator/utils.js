const axios = require('axios');
const hash = require('object-hash');

const config = require('./config.json');
const HarvesterInputFactory = require('./harvester-input.factory');
const url = `http://${config.drHarvester.host}:${config.drHarvester.port}`;

const createInput = (duty, batV, irr) => HarvesterInputFactory(duty, batV, irr);

const postSimulation = async (inputData) => {
  console.log(`Querying DrHarvester for a new simulation - Duty: ${inputData.duty} - batV: ${inputData.batV}`);
  let { data } = await axios.post(`${url}/harvester/simulation`, inputData);
  console.info(`Simulation response: ${data.jobId}`);
  return data.jobId;
};

const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const getSimulationResult = async (jobId) => {
  let terminated = false;
  let simulation = null;
  try {
    do {
      console.info(`Sleeping for ${config.requestInterval}s...`);
      await sleep(config.requestInterval);
      console.info(`Resquest to DrHarvester for ${jobId}`);
      let response = await axios.get(`${url}/harvester/simulation/${jobId}`);
      console.log(response.data);
      terminated = response.data.terminated;
      simulation = response.data;
    } while (!terminated);
    return simulation;
  } catch (err) {
    return new Error(err.message);
  }
};

const hashData = (inputData, outputData) => {
  const { devId, ...input } = inputData;
  const hashedData = {
    _id: hash(input),
    ...outputData,
  };
  return hashedData;
};



function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


module.exports = {
  createInput,
  hashData,
  getSimulationResult,
  postSimulation,
  getRandomInt
};
