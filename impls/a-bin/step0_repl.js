const { stdin, stdout } = process;

const READ = (str) => str;
const EVAL = (ast) => ast;
const PRINT = (exp) => exp;
const REP = (str) => PRINT(EVAL(READ(str)));

stdin.setEncoding('utf-8');
stdout.setEncoding('utf-8');
stdout.write('user-> ');

stdin.on('data', (chunk) => {
  stdout.write(REP(chunk));
  stdout.write('user-> ');
});
