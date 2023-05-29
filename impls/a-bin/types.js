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

const concatMap = (value) => {
  const color = getBracketColor();
  const content = [];
  value.forEach((x, i, a) => {
    if (i % 2 === 0) {
      content.push(chalk.magenta(x.printStr()) + ' ' + a[i + 1].printStr());
    }
  });
  return chalk[color]('{') + content.join(', ') + chalk[color]('}');
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

class MalStruct extends MalValue {
  constructor(value) {
    super(value);
  }

  isEmpty() {
    return this.value.length === 0;
  }
}

class MalList extends MalStruct {
  constructor(value) {
    super(value);
  }

  printStr() {
    return concat('(', this.value, ')');
  }
}

class MalVector extends MalStruct {
  constructor(value) {
    super(value);
  }

  printStr() {
    return concat('[', this.value, ']');
  }
}

class MalMap extends MalStruct {
  constructor(value) {
    super(value);
  }

  printStr() {
    return concatMap(this.value);
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

module.exports = {
  MalSymbol,
  MalValue,
  MalList,
  MalVector,
  MalNil,
  MalBool,
  MalMap,
};
