module.exports = (duty, batV, type = 'shm') => {
  let parameters;
  if (type === 'shm')
    parameters = {
      lowpwrI: 400,
      activeI: 715,
      //activeI: 3500,
      Vload: 5,
      batV: batV,
      phIrr: 700,
      harvId: 'SolarHeavyLoad',
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
      phIrr: 700,
      thThot: null,
      thTcold: null,
      thGrad: null,
      vibAcc: null,
      vibFreq: null,
    };

  return {
    harvId: parameters.harvId,
    devId: type,
    lowpwrI: parameters.lowpwrI,
    activeI: parameters.activeI,
    duty: duty,
    Vload: parameters.Vload,
    devAvgI: null,
    batSOC: null,
    batV: batV,
    phIrr: parameters.phIrr,
    thThot: null,
    thTcold: null,
    thGrad: null,
    vibAcc: null,
    vibFreq: null,
  };
};
