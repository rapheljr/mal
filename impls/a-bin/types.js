const chalk = require('chalk');

const random = (limit = 10) => Math.floor(Math.random() * limit);

const bracketColors = [
  'red',
  'blue',
  'magenta',
  'cyan',
  'white',
  'redBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
  'whiteBright',
];

const getBracketColor = () => bracketColors[random(bracketColors.length)];

const concat = (open, value, close) => {
  const color = getBracketColor();
  const content = value.map((x) => x.printStr()).join(' ');
  return chalk[color](open) + content + chalk[color](close);
};

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
    return concat('(', this.value, ')');
  }

  isEmpty() {
    return this.value.length === 0;
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value);
  }

  printStr() {
    return concat('[', this.value, ']');
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
