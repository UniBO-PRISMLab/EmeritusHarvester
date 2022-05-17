const config = require('./config.json')

module.exports = (duty, batV, irr) => {
  if ('shm' === config.sensorType)
    return {
      devId: 'ClusterHead',
      harvId: 'SolarHeavyLoad',
      lowpwrI: 400,
      activeI: 715,
      duty: duty,
      Vload: 5,
      devAvgI: null,
      batSOC: null,
      batV: '' + batV,
      phIrr: irr,
      thThot: null,
      thTcold: null,
      thGrad: null,
      vibAcc: null,
      vibFreq: null,
    };
  else
    return {
      devId: 'GasSensor',
      harvId: 'SolarLightLoad',
      lowpwrI: 3,
      activeI: 10,
      duty: duty,
      Vload: 3.3,
      devAvgI: null,
      batSOC: null,
      batV: '' + batV,
      phIrr: irr,
      thThot: null,
      thTcold: null,
      thGrad: null,
      vibAcc: null,
      vibFreq: null,
    };
};
