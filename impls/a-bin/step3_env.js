const readline = require('readline');
const { readStr } = require('./reader');
const { printStr } = require('./printer');
const { MalSymbol, MalList, MalValue, MalVector, MalMap } = require('./types');
const { Env } = require('./env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const evalAst = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalList(newAst);
  }

  if (ast instanceof MalVector) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalVector(newAst);
  }

  if (ast instanceof MalMap) {
    const newAst = ast.value.map((x) => EVAL(x, env));
    return new MalMap(newAst);
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
  if (!(ast instanceof MalList)) {
    return evalAst(ast, env);
  }

  if (ast.isEmpty()) return ast;

  switch (ast.value[0].value) {
    case 'def!':
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1]);

    case 'let*':
      const letEnv = new Env(env);
      const bind = ast.value[1];
      letEnv.set(bind.value[0], EVAL(bind.value[1], letEnv));
      return EVAL(ast.value[2], letEnv);
  }

  const [fn, ...args] = evalAst(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = (exp) => printStr(exp);

const env = new Env();
env.set(new MalSymbol('+'), (...args) =>
  args.reduce((a, b) => new MalValue(a.value + b.value))
);
env.set(new MalSymbol('-'), (...args) =>
  args.reduce((a, b) => new MalValue(a.value - b.value))
);
env.set(new MalSymbol('*'), (...args) =>
  args.reduce((a, b) => new MalValue(a.value * b.value))
);
env.set(new MalSymbol('/'), (...args) =>
  args.reduce((a, b) => new MalValue(a.value / b.value))
);
env.set(new MalSymbol('list'), (...a) => new MalList(a));
env.set(new MalSymbol('vector'), (...a) => new MalVector(a));

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
