const { MalValue, MalList } = require('./types');

class Env {
  constructor(outer, binds = [], exprs = []) {
    this.outer = outer;
    this.binds = binds;
    this.exprs = exprs;
    this.data = {};
  }

  bind(args) {
    const params = this.binds.value.length;

    for (let i = 0; i < params; i++) {
      const value = this.binds.value[i].value;

      if (value === '&') {
        const symbol = this.binds.value[i + 1];
        const rest = args.slice(i);
        return this.set(symbol, new MalList(rest));
      }

      this.set(this.binds.value[i], args[i]);
    }
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
