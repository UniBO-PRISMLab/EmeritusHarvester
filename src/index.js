const logger = require("./config/log");
const server = require("./server");

server
  .start()
  .then((res) => {
    logger.info(`Emeritus Harvester started - demo version`);
    logger.debug(res);
  })
  .catch((err) => {
    logger.error(err);
  });
