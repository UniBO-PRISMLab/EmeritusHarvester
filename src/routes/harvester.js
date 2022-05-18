const harvesterController = require('../controllers/harvester.controller');

module.exports = (router) => {
  router.post('/simulation', async (req, res, _next) =>
    harvesterController.simulationPost(req, res)
  );
  router.get('/simulation/:id', async (req, res, _next) =>
    harvesterController.simulationGet(req, res)
  );
};
