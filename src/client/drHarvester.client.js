const axios = require('axios');

const config = require('../config/conf.json');
const logger = require('../config/log');
const url = `http://${config.drHarvester.host}:${config.drHarvester.port}`;

const postSimulation = async (inputData, isCache, hash) => {
  try {
    logger.info(
      `Querying DrHarvester for simulation ${hash} - Duty: ${inputData.duty} - batV: ${inputData.batSOC}`
    );
    logger.info(inputData);
    let { data } = await axios.post(`${url}/harvester/simulation`, {
      isCache: isCache,
      ...inputData,
    });
    logger.info(`Simulation response of hash ${hash}: ${data.jobId}`);
    return data.jobId;
  } catch (error) {
    return new Error(error.message);
  }
};

const getSimulationResult = async (jobId, isCache = false) => {
  let terminated = false;
  let simulation = null;
  try {
    do {
      if (!isCache) {
        logger.info(`Sleeping for ${config.requestInterval}s...`);
        await sleep(config.requestInterval);
      }
      logger.info(`Resquest to DrHarvester for ${jobId}`);
      let response = await axios.get(`${url}/harvester/simulation/${jobId}`);
      logger.info(response.data);
      terminated = response.data.terminated;
      simulation = response.data;
    } while (!terminated);
    return simulation;
  } catch (err) {
    console.log(err);
    //process.exit();

    return new Error(err.message);
  }
};

const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

module.exports = {
  getSimulationResult,
  postSimulation,
};
