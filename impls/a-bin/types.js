const chalk = require('chalk');

class MalValue {
  constructor(value) {
    this.value = value;
  }

  printStr() {
    return chalk.yellow(this.value.toString());
  }

  equals(another) {
    return another instanceof MalValue;
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }

  printStr() {
    return chalk.green(this.value.toString());
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

class MalBool extends MalValue {
  constructor(value) {
    super(value);
  }

  printStr() {
    return chalk.blue(this.value);
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
  }

  printStr() {
    return chalk.grey('nil');
  }
}

module.exports = { MalSymbol, MalValue, MalList, MalVector, MalNil, MalBool };
