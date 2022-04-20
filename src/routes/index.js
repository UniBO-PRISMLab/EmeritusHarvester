const express = require("express");
const routes = require("require-dir")();

module.exports = (app) => {

  //iterate through each child route
  for (const route in routes) {
    const router = express.Router();
    // Initialize the route to add its functionality to router
    require(`./${route}`)(router);
    app.use(`/${route}`, router);
  }
};
