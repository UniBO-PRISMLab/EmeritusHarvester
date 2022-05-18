const fs = require('fs');

const logger = require('../config/log');

const record = (name, data) => {
  //logger.info(`record file ${name} with data ${data}`)
  const recordEntry = `${data}\n`;
  fs.appendFile(`src/experiments/${name}.csv`, recordEntry, (err) => {
    if (err) return logger.error(err);
    logger.info(`new entry at ${name}.csv: ${recordEntry}`);
  });
};

module.exports = record;
