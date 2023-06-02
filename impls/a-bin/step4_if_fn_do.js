const readline = require('readline');
const chalk = require('chalk');
const { readStr } = require('./reader');
const { printStr } = require('./printer');
const {
  MalSymbol,
  MalList,
  MalVector,
  MalMap,
  MalNil,
  MalFn,
} = require('./types');
const { Env } = require('./env');
const core = require('./core');

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
        return EVAL(exprs, fnEnv);
      };

      return new MalFn(fn);
  }

  const [fn, ...args] = evalAst(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = (exp) => printStr(exp);

const rep = (str) => PRINT(EVAL(READ(str), core.env));

const REPL = () =>
  rl.question('user-> ', (line) => {
    try {
      console.log(rep(line));
    } catch (error) {
      console.log(chalk.red(error));
    }
    REPL();
  });

REPL();
