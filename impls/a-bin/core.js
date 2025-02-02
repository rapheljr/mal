const fs = require('fs');
const {
  MalList,
  MalVector,
  MalNil,
  MalBool,
  MalString,
  MalAtom,
  MalNumber,
} = require('./types');
const { isDeepStrictEqual } = require('util');
const { readStr } = require('./reader');
const { printStr } = require('./printer');

const takeValues = (args) => args.map((arg) => arg.value);

const multipleCheck = (args, predicate) => {
  const result = [];
  for (let index = 0; index < args.length - 1; index++) {
    result.push(predicate(args[index], args[index + 1]));
  }
  return new MalBool(result.every((a) => a === true));
};

const ns = {
  '+': (...args) => args.reduce((a, b) => new MalNumber(a.value + b.value)),
  '-': (...args) => args.reduce((a, b) => new MalNumber(a.value - b.value)),
  '*': (...args) => args.reduce((a, b) => new MalNumber(a.value * b.value)),
  '%': (...args) => args.reduce((a, b) => new MalNumber(a.value % b.value)),
  '/': (...args) => args.reduce((a, b) => new MalNumber(a.value / b.value)),
  '>': (...args) => multipleCheck(takeValues(args), (a, b) => a > b),
  '<': (...args) => multipleCheck(takeValues(args), (a, b) => a < b),
  '=': (...args) => args.every((arg) => isDeepStrictEqual(arg, args[0])),
  '>=': (...args) => multipleCheck(takeValues(args), (a, b) => a >= b),
  '<=': (...args) => multipleCheck(takeValues(args), (a, b) => a <= b),
  not: (a) => {
    const bool = a.value === false || a.value === null;
    return new MalBool(bool);
  },
  str: (...args) => new MalString(args.map((x) => printStr(x, false)).join('')),
  prn: (...args) => {
    const text = args.map((arg) => arg.toString()).join(' ');
    console.log(text);
    return new MalNil();
  },
  list: (...a) => new MalList(a),
  'list?': (a) => a instanceof MalList,
  vector: (...a) => new MalVector(a),
  'vector?': (a) => a instanceof MalVector,
  count: (a) => new MalNumber(a.value?.length),
  'empty?': (a) => new MalBool(a.value.length === 0),
  'pr-str': (...args) => {
    const text = args.map((arg) => arg.toString()).join(' ');
    const updated = text.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
    return new MalString(updated);
  },

  println: (...args) => {
    const text = args.map((arg) => arg.value).join(' ');
    const updated = text.replaceAll('\\n', '\n');
    console.log(updated);
    return new MalNil();
  },
  'read-string': (str) => readStr(str.value),
  slurp: (file) => new MalString(fs.readFileSync(file.value, 'utf-8')),
  atom: (val) => new MalAtom(val),
  'atom?': (val) => val instanceof MalAtom,
  deref: (atom) => atom.deref(),
  'reset!': (atom, val) => atom.reset(val),
  'swap!': (atom, fun, ...args) => atom.swap(fun, args),
  cons: (val, list) => new MalList([val, ...list.value]),
  concat: (...list) => new MalList(list.flatMap((x) => x.value)),
  vec: (list) => new MalVector(list.value.slice()),
  nth: (list, n) => list.nth(n),
  first: (list) => (list instanceof MalNil ? list : list.first()),
  rest: (list) => (list instanceof MalNil ? new MalList([]) : list.rest()),
};

module.exports = { ns };
