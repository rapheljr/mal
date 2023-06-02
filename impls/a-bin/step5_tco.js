const readline = require('readline');
const chalk = require('chalk');
const { readStr } = require('./reader');
const { printStr } = require('./printer');
const { MalSymbol, MalList, MalVector, MalMap, MalFun } = require('./types');
const core = require('./core');
const {
  handleDef,
  handleLet,
  handleDo,
  handleIf,
  handleFun,
} = require('./handlers');
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

const READ = (str) => readStr(str);

const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof MalList)) {
      return evalAst(ast, env);
    }

    if (ast.isEmpty()) return ast;

    switch (ast.value[0].value) {
      case 'def!':
        return handleDef(ast, env, EVAL);

      case 'def':
        return handleDef(ast, env, EVAL);

      case 'let*':
        [ast, env] = handleLet(ast, env, EVAL);
        break;

      case 'let':
        [ast, env] = handleLet(ast, env, EVAL);
        break;

      case 'do':
        ast = handleDo(ast, env, EVAL);
        break;

      case 'if':
        ast = handleIf(ast, env, EVAL);
        break;

      case 'fun':
        ast = handleFun(ast, env, EVAL);
        break;

      case 'fn*':
        ast = handleFun(ast, env, EVAL);
        break;

      default:
        const [fn, ...args] = evalAst(ast, env).value;
        if (fn instanceof MalFun) {
          ast = fn.value;
          env = new Env(fn.env, fn.binds, args);
        } else {
          return fn.apply(null, args);
        }
    }
  }
};

const PRINT = (exp) => printStr(exp);

const rep = (str) => PRINT(EVAL(READ(str), core.env));

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
