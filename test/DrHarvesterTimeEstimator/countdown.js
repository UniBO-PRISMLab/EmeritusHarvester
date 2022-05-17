
const countdown = async (seconds, func, payload) => {
  const start = process.hrtime();
  while (seconds > process.hrtime(start)[0]) await func(payload);
};

module.exports = countdown;
