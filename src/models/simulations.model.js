module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      _id: String,
      terminated: Boolean,
      result: {
        devId: String,
        harvId: String,
        batState: Number,
        batlifeh: Number,
        tChargeh: Number,
        dSOCrate: Number,
        date: String,
        simStatus: Number,
      },
    },
    { timestamps: true }
  );

  schema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });
  //TODO: rename collection 'simulation'
  return mongoose.model('simulations', schema);
};
