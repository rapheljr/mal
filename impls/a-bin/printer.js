const printStr = (malValue) => {
  if (Array.isArray(malValue)) {
    return '(' + malValue.map(printStr).join(' ') + ')';
  }
  return malValue.toString();
};

module.exports = { printStr };
