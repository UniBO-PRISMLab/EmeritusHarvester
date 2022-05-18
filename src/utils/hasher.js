const hash = require('object-hash');

const hashData = (hash, outputData) => {
  //const { isCache, experimentName, ...input } = inputData;
  const hashedData = {
    //_id: hash(input),
    _id: hash,
    ...outputData,
  };
  return hashedData;
};

module.exports = hashData;
