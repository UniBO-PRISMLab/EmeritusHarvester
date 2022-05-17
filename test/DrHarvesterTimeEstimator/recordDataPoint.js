const fs = require('fs');


const record = (name, time) => {
  const recordEntry = `${time}\n`;
  fs.appendFile(`${name}.csv`, recordEntry, (err) => {
    if (err) return console.log(err);
    console.info(`new entry at ${name}.csv: ${recordEntry}`);
  });
};

module.exports = record;
