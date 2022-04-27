const harvesterController = require('../controllers/harvester.controller');

module.exports = (router) => {
  router.post('/simulation', async (req, res, _next) =>
    res.status(200).send({
      jobId: 'f250064da3ea165684e88648ae4d2b5d28e60ccb',
    })
  );
  router.get('/simulation/:id', async (req, res, _next) =>
    res.status(200).send({
      result: {
        devId: 'fake',
        harvId: 'SolarLightLoad',
        batState: 0,
        batlifeh: 299.951,
        tChargeh: -1,
        dSOCrate: -0.3,
        date: '20-Apr-2022 16:41:17',
        simStatus: 0,
      },
      terminated: true,
      createdAt: '2022-04-20T14:41:30.195Z',
      updatedAt: '2022-04-20T14:41:30.195Z',
      id: 'f250064da3ea165684e88648ae4d2b5d28e60ccb',
    })
  );
};
