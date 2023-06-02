const { Env } = require('./env');
const {
  MalSymbol,
  MalList,
  MalValue,
  MalVector,
  MalNil,
  MalBool,
  MalStruct,
  MalString,
} = require('./types');
const { isDeepStrictEqual } = require('util');

const takeValues = (args) => args.map((arg) => arg.value);

const multipleCheck = (args, predicate) => {
  const result = [];
  for (let index = 0; index < args.length - 1; index++) {
    result.push(predicate(args[index], args[index + 1]));
  }
  return new MalBool(result.every((a) => a === true));
};

const env = new Env();
env.set(new MalSymbol('+'), (...args) =>
  args.reduce((a, b) => {
    if (a instanceof MalStruct) {
      return new MalString(a.toString() + b.toString());
    }
    return new MalValue(a.value + b.value);
  })
);
env.set(new MalSymbol('-'), (...args) =>
  args.reduce((a, b) => new MalValue(a.value - b.value))
);
env.set(new MalSymbol('*'), (...args) =>
  args.reduce((a, b) => new MalValue(a.value * b.value))
);
env.set(new MalSymbol('%'), (...args) =>
  args.reduce((a, b) => new MalValue(a.value % b.value))
);
env.set(new MalSymbol('/'), (...args) =>
  args.reduce((a, b) => new MalValue(a.value / b.value))
);
env.set(new MalSymbol('>'), (...args) =>
  multipleCheck(takeValues(args), (a, b) => a > b)
);
env.set(new MalSymbol('<'), (...args) =>
  multipleCheck(takeValues(args), (a, b) => a < b)
);
env.set(new MalSymbol('='), (...args) =>
  multipleCheck(takeValues(args), (a, b) => isDeepStrictEqual(a, b))
);
env.set(new MalSymbol('>='), (...args) =>
  multipleCheck(takeValues(args), (a, b) => a >= b)
);
env.set(new MalSymbol('<='), (...args) =>
  multipleCheck(takeValues(args), (a, b) => a <= b)
);
env.set(new MalSymbol('not'), (a) => {
  const bool = a.value === false || a.value === null;
  return new MalBool(bool);
});
env.set(
  new MalSymbol('str'),
  (...args) =>
    new MalString(
      args
        .map((arg) => {
          if (arg instanceof MalStruct) {
            return arg.toString();
          }
          return arg.value;
        })
        .join('')
    )
);
env.set(new MalSymbol('prn'), (...args) => {
  const text = args.map((arg) => arg.toString()).join(' ');
  console.log(text);
  return new MalNil();
});
env.set(new MalSymbol('list'), (...a) => new MalList(a));
env.set(new MalSymbol('list?'), (a) => a instanceof MalList);
env.set(new MalSymbol('vector'), (...a) => new MalVector(a));
env.set(new MalSymbol('vector?'), (a) => a instanceof MalVector);
env.set(new MalSymbol('count'), (a) => new MalValue(a.value?.length));
env.set(new MalSymbol('empty?'), (a) => new MalBool(a.value.length === 0));
env.set(new MalSymbol('pr-str'), (...args) => {
  const text = args.map((arg) => arg.toString()).join(' ');
  const updated = text.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  return new MalString(updated);
});

env.set(new MalSymbol('println'), (...args) => {
  const text = args.map((arg) => arg.value).join(' ');
  const updated = text.replaceAll('\\n', '\n');
  console.log(updated);
  return new MalNil();
});

module.exports = { env };
