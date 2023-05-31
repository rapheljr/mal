const { MalValue } = require('./types');

class Env {
  constructor(outer, binds = [], exprs = []) {
    this.outer = outer;
    this.binds = binds;
    this.exprs = exprs;
    this.data = {};
  }

  bind(args) {
    args.forEach((exp, i) => {
      this.set(this.binds.value[i], exp);
    });
  }

  set(symbol, malValue) {
    this.data[symbol.value] = malValue;
  }

  find(symbol) {
    if (this.data[symbol.value]) {
      return this;
    }
    if (this.outer) {
      return this.outer.find(symbol);
    }
  }

  get(symbol) {
    const env = this.find(symbol);
    if (!env) {
      throw new Error(`${symbol.value} not found`);
    }
    return env.data[symbol.value];
  }
  equals(another) {
    return another instanceof Env;
  }
}

module.exports = { Env };
