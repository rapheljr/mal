const chalk = require('chalk');

const random = (limit = 10) => Math.floor(Math.random() * limit);

const bracketColors = [
  'red',
  'blue',
  'cyan',
  'green',
  'white',
  'magenta',
  'redBright',
  'blueBright',
  'greenBright',
  'magentaBright',
  'cyanBright',
  'whiteBright',
];

const getBracketColor = () => bracketColors[random(bracketColors.length)];

const concat = (open, value, close) => {
  const color = getBracketColor();
  const content = value.map((x) => x.toString()).join(' ');
  return chalk[color](open) + content + chalk[color](close);
};

const concatMap = (value) => {
  const color = getBracketColor();
  const content = [];
  value.forEach((x, i, a) => {
    if (i % 2 === 0) {
      content.push(chalk.magenta(x.toString()) + ' ' + a[i + 1].toString());
    }
  });
  return chalk[color]('{') + content.join(', ') + chalk[color]('}');
};

class MalValue {
  constructor(value) {
    this.value = value;
  }

  toString() {
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

  toString() {
    return chalk.white(this.value.toString());
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

  toString() {
    return concat('(', this.value, ')');
  }
}

class MalVector extends MalStruct {
  constructor(value) {
    super(value);
  }

  toString() {
    return concat('[', this.value, ']');
  }
}

class MalMap extends MalStruct {
  constructor(value) {
    super(value);
  }

  toString() {
    return concatMap(this.value);
  }
}

class MalBool extends MalValue {
  constructor(value) {
    super(value);
  }

  toString() {
    return chalk.blue(this.value);
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null);
  }

  toString() {
    return chalk.grey('nil');
  }
}

class MalKeyword extends MalValue {
  constructor(value) {
    super(value);
  }

  toString() {
    return chalk.magenta(this.value.toString());
  }
}

class MalString extends MalValue {
  constructor(value) {
    super(value);
  }

  toString() {
    return chalk.greenBright(`"` + this.value.toString() + `"`);
  }
}

class MalFun extends MalValue {
  constructor(ast, binds, env) {
    super(ast);
    this.binds = binds;
    this.env = env;
  }

  toString() {
    return chalk.cyanBright('#<function>');
  }

  apply(_, args) {
    return this.value(...args);
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
  MalFun,
  MalKeyword,
  MalString,
  MalStruct,
};
