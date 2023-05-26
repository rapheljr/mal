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

const readList = (reader) => {
  reader.next();
  const ast = [];
  while (reader.peek() !== ')') {
    ast.push(readForm(reader));
  }
  reader.next();
  return ast;
};

const readAtom = (reader) => {
  const token = reader.next();
  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }
  return token;
};

const readForm = (reader) => {
  const token = reader.peek();
  switch (token) {
    case '(':
      return readList(reader);
    default:
      return readAtom(reader);
  }
};

const readStr = (str) => readForm(new Reader(tokenize(str)));

module.exports = { readStr };
