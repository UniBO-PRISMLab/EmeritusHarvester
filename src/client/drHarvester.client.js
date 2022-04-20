const axios = require('axios');

const config = require('../config/conf.json')
const logger = require('../config/log')
const url = `http://${config.drHarvester.host}:${config.drHarvester.port}`;




const postSimulation = async (inputData) => {
  logger.info(
    `Querying DrHarvester for a new simulation - Duty: ${inputData.duty} - batV: ${inputData.batV}`
  );
  let { data } = await axios.post(`${url}/harvester/simulation`, inputData);
  logger.info(`Simulation response: ${data.jobId}`);
  return data.jobId;
};

const getSimulationResult = async (jobId) => {
  let terminated = false;
  let simulation = null;
  try {
    do {
      logger.info(`Sleeping for ${config.requestInterval}s...`);
      await sleep(config.requestInterval);
      logger.info(`Resquest to DrHarvester for ${jobId}`);
      let response = await axios.get(`${url}/harvester/simulation/${jobId}`);
      logger.info(response.data);
      terminated = response.data.terminated;
      simulation = response.data;
    } while (!terminated);
    return simulation;
  } catch (err) {
    return new Error(err.message);
  }
};

const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

module.exports = {
  getSimulationResult,
  postSimulation,
};
