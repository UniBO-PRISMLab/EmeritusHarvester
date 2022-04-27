const db = require("../../src/models");

const connectMongo = async () => {
  console.info("connecting to db at " + db.url);
  try {
    await db.mongoose.connect(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.info("Connected to the database!");
  } catch (error) {
    console.info({
      message: "Cannot connect to the database",
      error: error,
    });
    process.exit();
  }
};

module.exports = {
  connectMongo,
};
