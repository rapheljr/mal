const readline = require('readline');
const { readStr } = require('./reader');
const { printStr } = require('./printer');
const { MalSymbol, MalList, MalValue, MalVector, MalMap } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = {
  '+': (a, b) => new MalValue(a.value + b.value),
  '-': (a, b) => new MalValue(a.value - b.value),
  '*': (a, b) => new MalValue(a.value * b.value),
  '/': (a, b) => new MalValue(a.value / b.value),
  list: (...a) => new MalList(a),
  vector: (...a) => new MalVector(a),
};

const evalAst = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env[ast.value];
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalList(newAst);
  }

  if (ast instanceof MalVector) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalVector(newAst);
  }

  return ast;
};

const evalListInSeq = (ast, cb) => {
  return ast.value.map((val) => {
    if (val instanceof MalList) {
      return cb(val, env);
    }
    return val;
  });
};

const READ = (str) => readStr(str);
const EVAL = (ast, env) => {
  if (ast instanceof MalMap) {
    return new MalMap(evalListInSeq(ast, EVAL));
  }

  if (ast instanceof MalVector) {
    return new MalVector(evalListInSeq(ast, EVAL));
  }

  if (!(ast instanceof MalList)) {
    return evalAst(ast, env);
  }

  if (ast.isEmpty()) return ast;

  const [fn, ...args] = evalAst(ast, env).value;
  return fn.apply(null, args);
};
const PRINT = (exp) => printStr(exp);
const rep = (str) => PRINT(EVAL(READ(str), env));

const REPL = () =>
  rl.question('user-> ', (line) => {
    try {
      console.log(rep(line));
    } catch (error) {
      console.log(error);
    }
    REPL();
  });

REPL();
