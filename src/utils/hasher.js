const hash = require('object-hash');

const hashData = (inputData, outputData) => {
  const { devId, ...input } = inputData;
  const hashedData = {
    _id: hash(input),
    ...outputData,
  };
  return hashedData;
};

module.exports = hashData;
