const readline = require('readline');
const { readStr } = require('./reader');
const { printStr } = require('./printer');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = (str) => readStr(str);
const EVAL = (ast) => ast;
const PRINT = (exp) => printStr(exp);
const rep = (str) => PRINT(EVAL(READ(str)));

const REPL = () =>
  rl.question('user-> ', (line) => {
    console.log(rep(line));
    REPL();
  });

REPL();
