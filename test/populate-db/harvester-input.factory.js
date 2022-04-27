module.exports = (duty, batV, type = 'shm') => {
  let parameters;
  if (type === 'shm')
    parameters = {
      lowpwrI: 400,
      //activeI: 715,
      activeI: 3500,
      Vload: 5,
      batV: batV,
      phIrr: 700,
    };
  else
    parameters = {
      lowpwrI: 3,
      activeI: 10,
      Vload: 3.3,
      phIrr: 700,
    };

  return {
    devId: type,
    harvId: 'SolarHeavyLoad',
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
