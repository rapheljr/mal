const { MalValue } = require('./types');

const printStr = (malValue) => {
  if (malValue instanceof MalValue) return malValue.printStr();
  return malValue.toString();
};

module.exports = { printStr };
