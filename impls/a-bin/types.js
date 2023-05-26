class MalValue {
  constructor(value) {
    this.value = value;
  }

  printStr() {
    return this.value.toString();
  }

  equals(another) {
    return another instanceof MalValue;
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
}

class MalList extends MalValue {
  constructor(value) {
    super(value);
  }

  printStr() {
    return '(' + this.value.map((x) => x.printStr()).join(' ') + ')';
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  printStr() {
    return '[' + this.value.map((x) => x.printStr()).join(' ') + ']';
  }
}

module.exports = { MalSymbol, MalValue, MalList, MalVector };
