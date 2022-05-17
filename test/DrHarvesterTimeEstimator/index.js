const utils = require('./utils');
const record = require('./recordDataPoint');

const start = async () => {
  try {
    for (let i = 0; i < 1000; i++)
      await saveSimulation(
        utils.getRandomInt(1, 100),
        utils.getRandomInt(1, 100),
        utils.getRandomInt(0, 1000)
      );
  } catch (err) {
    console.error(err);
  }
};

const saveSimulation = async (duty, batteryLevel, irradiance) => {
  const input = utils.createInput(duty, batteryLevel, irradiance);
  console.log(input);
  const hrstart = process.hrtime();
  const simulationId = await utils.postSimulation(input);
  const simulation = await utils.getSimulationResult(simulationId);
  const time = process.hrtime(hrstart);
  const elapsed = time[0] + time[1] / 1000000000;
  console.log(`Simulation ended. Time elapsed: ${elapsed}`);
  record('smh-avg-time', elapsed);
  return;
};

start()
  .then(() => {})
  .catch((err) => {
    console.error(err);
  });
