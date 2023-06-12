const {
  MalValue,
  MalSymbol,
  MalList,
  MalVector,
  MalNil,
  MalBool,
  MalMap,
  MalKeyword,
  MalString,
  MalNumber,
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

const parseStr = (str) =>
  str
    .slice(1, str.length - 1)
    .replace(/\\(.)/g, (_, c) => (c === 'n' ? '\n' : c));

const prependSymbol = (reader, str) => {
  reader.next();
  const symbol = new MalSymbol(str);
  const newAst = readForm(reader);
  return new MalList([symbol, newAst]);
};

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
      throw new Error('Unbalanced ' + closingSymbol);
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

const readMap = (reader) => {
  const ast = readSeq(reader, '}');
  if (ast.length % 2 !== 0) {
    const lastAst = ast[ast.length - 1];
    throw new Error('No pair found for ' + lastAst.toString());
  }
  return new MalMap(ast);
};

const readAtom = (reader) => {
  const token = reader.next();
  if (token.match(/^-?[\d]+$/)) {
    return new MalNumber(parseInt(token));
  }
  if (token.match(/^-?[\d]+.[\d]+$/)) {
    return new MalNumber(parseFloat(token));
  }
  if (token.startsWith(':')) {
    return new MalKeyword(token);
  }
  if (token.startsWith(';')) {
    return new MalNil();
  }
  if (token.startsWith('"') && token.endsWith('"')) {
    return new MalString(parseStr(token));
  }
  if (token === 'true') {
    return new MalBool(true);
  }
  if (token === 'false') {
    return new MalBool(false);
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
    case '{':
      return readMap(reader);
    case '@':
      return prependSymbol(reader, 'deref');
    case `'`:
      return prependSymbol(reader, 'quote');
    case '`':
      return prependSymbol(reader, 'quasiquote');
    case '~':
      return prependSymbol(reader, 'unquote');
    case '~@':
      return prependSymbol(reader, 'splice-unquote');
    default:
      return readAtom(reader);
  }
};

const readStr = (str) => readForm(new Reader(tokenize(str)));

module.exports = { readStr };
