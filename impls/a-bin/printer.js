const { MalValue } = require('./types');

const printStr = (malValue) => {
  if (malValue instanceof MalValue) return malValue.toString();
  return malValue.toString();
};

module.exports = { printStr };
