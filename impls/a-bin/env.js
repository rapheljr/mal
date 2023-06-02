const { MalValue, MalList } = require('./types');

class Env {
  constructor(outer, binds = [], exprs = []) {
    this.outer = outer;
    this.data = {};
    this.binds = binds;
    this.exprs = exprs;
    this.#bind();
  }

  #bind() {
    const params = this.binds.length;

    for (let i = 0; i < params; i++) {
      const value = this.binds[i].value;

      if (value === '&') {
        const symbol = this.binds[i + 1];
        const rest = this.exprs.slice(i);
        return this.set(symbol, new MalList(rest));
      }

      this.set(this.binds[i], this.exprs[i]);
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
