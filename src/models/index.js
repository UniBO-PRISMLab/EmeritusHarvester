const mongoose = require("mongoose");
const { mongo } = require("../config/conf.json");
const url = `mongodb://${mongo.host}:${mongo.port}/${mongo.db}`;

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = url;
db.simulations = require("./simulations.model.js")(mongoose);

module.exports = db;
