const gConfig = require("../conf.json");
const pino = require("pino")({
  level: gConfig.logLevel,
  transport: {
    target: "pino-pretty",
    options: {
      levelFirst: true,
      translateTime: true,
      colorize: true,
      ignore: "pid,hostname", 
    },
  },
});


module.exports = pino;
