const chalk = require('chalk');
const {
  MalValue,
  MalSymbol,
  MalList,
  MalVector,
  MalNil,
  MalBool,
} = require('./types');

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }
  next() {
    return this.tokens[this.position++];
  }
  peek() {
    return this.tokens[this.position];
  }
  equals(another) {
    return another instanceof Reader;
  }
}

const tokenize = (str) => {
  const re =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return [...str.matchAll(re)].map((x) => x[1]);
};

const readSeq = (reader, closingSymbol) => {
  reader.next();
  const ast = [];
  while (reader.peek() !== closingSymbol) {
    if (!reader.peek()) {
      throw new Error(chalk.red('unbalanced ' + closingSymbol));
    }
    ast.push(readForm(reader));
  }
  reader.next();
  return ast;
};

const readList = (reader) => {
  const ast = readSeq(reader, ')');
  return new MalList(ast);
};

const readVector = (reader) => {
  const ast = readSeq(reader, ']');
  return new MalVector(ast);
};

const readAtom = (reader) => {
  const token = reader.next();
  if (token.match(/^-?[0-9]+$/)) {
    return new MalValue(parseInt(token));
  }
  if (token === 'true') {
    return new MalBool(token);
  }
  if (token === 'false') {
    return new MalBool(token);
  }
  if (token === 'nil') {
    return new MalNil();
  }
  return new MalSymbol(token);
};

const readForm = (reader) => {
  const token = reader.peek();
  switch (token) {
    case '(':
      return readList(reader);
    case '[':
      return readVector(reader);
    default:
      return readAtom(reader);
  }
};

const readStr = (str) => readForm(new Reader(tokenize(str)));

module.exports = { readStr };
