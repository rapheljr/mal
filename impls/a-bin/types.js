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

const printStr = (val, printReadably = false) => {
  if (val instanceof MalValue) {
    return val.toString(printReadably);
  }

  if (val instanceof Function) {
    return chalk.cyanBright('#<function>');
  }

  return val.toString();
};

const concat = (open, value, close, printReadably) => {
  const color = getBracketColor();
  const content = value.map((x) => printStr(x, printReadably)).join(' ');
  return chalk[color](open) + content + chalk[color](close);
};

const concatMap = (value, printReadably) => {
  const color = getBracketColor();
  const content = [];
  value.forEach((x, i, a) => {
    if (i % 2 === 0) {
      content.push(
        chalk.magenta(x.toString(true)) + ' ' + a[i + 1].toString(printReadably)
      );
    }
  });
  return chalk[color]('{') + content.join(', ') + chalk[color]('}');
};

class MalValue {
  constructor(value) {
    this.value = value;
  }

  toString(printReadably) {
    return chalk.yellow(this.value.toString());
  }

  equals(another) {
    return another instanceof MalValue;
  }
}

class MalNumber extends MalValue {
  constructor(value) {
    this.value = value;
  }

  toString(printReadably) {
    return chalk.yellow(this.value.toString());
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }

  toString(printReadably) {
    return chalk.white(this.value.toString(printReadably));
  }
}

class MalAtom extends MalValue {
  constructor(value) {
    super(value);
  }

  toString() {
    return chalk.cyanBright('(atom ' + printStr(this.value, true) + ')');
  }

  deref() {
    return this.value;
  }

  reset(value) {
    this.value = value;
    return this.value;
  }

  swap(fun, args) {
    this.value = fun.apply(null, [this.value, ...args]);
    return this.value;
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

class MalIterable extends MalStruct {
  constructor(value) {
    super(value);
  }

  beginsWith(symbol) {
    return this.value.length > 0 && this.value[0] === symbol;
  }

  nth(n) {
    if (n >= this.value.length) return new Error('index out of range');
    return this.value[n];
  }

  first() {
    if (this.isEmpty()) {
      new MalNil();
    }
    return this.value[0];
  }

  rest() {
    return new MalList(this.value.slice(1));
  }
}

class MalList extends MalIterable {
  constructor(value) {
    super(value);
  }

  toString(printReadably) {
    return concat('(', this.value, ')', printReadably);
  }
}

class MalVector extends MalIterable {
  constructor(value) {
    super(value);
  }

  toString(printReadably) {
    return concat('[', this.value, ']', printReadably);
  }
}

class MalMap extends MalStruct {
  constructor(value) {
    super(value);
  }

  toString(printReadably) {
    return concatMap(this.value, printReadably);
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

  toString(printReadably = false) {
    if (printReadably) {
      return chalk.greenBright(
        '"' +
          this.value
            .replace(/\\/g, '\\')
            .replace(/"/g, '"')
            .replace(/\n/g, '\\n') +
          '"'
      );
    }
    return this.value.toString();
  }
}
class MalFun extends MalValue {
  constructor(ast, binds, env, fun = () => {}, isMacro = false) {
    super(ast);
    this.binds = binds;
    this.env = env;
    this.fun = fun;
    this.isMacro = isMacro;
  }

  toString() {
    return chalk.cyanBright('#<function>');
  }

  apply(_, args) {
    return this.fun.apply(null, args);
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
  MalAtom,
  printStr,
  MalIterable,
};
