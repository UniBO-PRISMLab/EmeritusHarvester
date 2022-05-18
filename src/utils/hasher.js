const hash = require('object-hash');

const hashData = (inputData, outputData) => {
  const { isCache, experimentName, ...input } = inputData;
  const hashedData = {
    _id: hash(input),
    ...outputData,
  };
  return hashedData;
};

module.exports = hashData;
