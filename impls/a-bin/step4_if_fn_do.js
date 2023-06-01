const readline = require('readline');
const { readStr } = require('./reader');
const { printStr } = require('./printer');
const {
  MalSymbol,
  MalList,
  MalValue,
  MalVector,
  MalMap,
  MalNil,
  MalBool,
  MalFn,
  MalStruct,
  MalString,
} = require('./types');
const { Env } = require('./env');
const chalk = require('chalk');

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
      const bindings = ast.value[1].value;
      for (let i = 0; i < bindings.length; i += 2) {
        letEnv.set(bindings[i], EVAL(bindings[i + 1], letEnv));
      }
      return EVAL(ast.value[2], letEnv);

    case 'do':
      const el = ast.value.slice(1);
      for (let i = 0; i < el.length - 1; i++) {
        EVAL(el[i], env);
      }
      return EVAL(el.slice(-1)[0], env);

    case 'if':
      const [, cond, thenExp, elseExp] = ast.value;

      const predicate = EVAL(cond, env);
      if (predicate.value !== false && !(predicate instanceof MalNil)) {
        return EVAL(thenExp, env);
      }
      if (elseExp === undefined) {
        return new MalNil();
      }
      return EVAL(elseExp, env);

    case 'fn*':
      const fn = (...args) => {
        const [, binds, exprs] = ast.value;
        const fnEnv = new Env(env, binds, exprs);
        fnEnv.bind(args);
        return EVAL(ast.value[2], fnEnv);
      };

      return new MalFn(fn);
  }

  const [fn, ...args] = evalAst(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = (exp) => printStr(exp);

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
      return new MalString(a.value + b.value);
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
env.set(new MalSymbol('/'), (...args) =>
  args.reduce((a, b) => new MalValue(a.value / b.value))
);
env.set(new MalSymbol('not'), (a) => new MalBool(!a.value));
env.set(
  new MalSymbol('str'),
  (...args) => new MalString(args.map((arg) => arg.value).join(''))
);
env.set(
  new MalSymbol('pr-str'),
  (...args) => new MalString(args.map((arg) => arg.toString()).join(''))
);
env.set(new MalSymbol('list'), (...a) => new MalList(a));
env.set(new MalSymbol('list?'), (a) => a instanceof MalList);
env.set(new MalSymbol('vector'), (...a) => new MalVector(a));
env.set(new MalSymbol('vector?'), (a) => a instanceof MalVector);
env.set(new MalSymbol('count'), (a) => new MalValue(a.value?.length));
env.set(new MalSymbol('empty?'), (a) => new MalBool(a.value.length === 0));
env.set(new MalSymbol('prn'), (...args) => {
  console.log(...takeValues(args));
  return new MalNil();
});
env.set(new MalSymbol('println'), (...args) => {
  console.log(...takeValues(args));
  return new MalNil();
});
env.set(new MalSymbol('>'), (...args) =>
  multipleCheck(takeValues(args), (a, b) => a > b)
);
env.set(new MalSymbol('<'), (...args) =>
  multipleCheck(takeValues(args), (a, b) => a < b)
);
env.set(new MalSymbol('='), (...args) =>
  multipleCheck(takeValues(args), (a, b) => a === b)
);
env.set(new MalSymbol('>='), (...args) =>
  multipleCheck(takeValues(args), (a, b) => a >= b)
);
env.set(new MalSymbol('<='), (...args) =>
  multipleCheck(takeValues(args), (a, b) => a <= b)
);

const rep = (str) => PRINT(EVAL(READ(str), env));

const REPL = () =>
  rl.question('user-> ', (line) => {
    try {
      console.log(rep(line));
    } catch (error) {
      console.log(chalk.red(error.message));
    }
    REPL();
  });

REPL();
