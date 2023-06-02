const { Env } = require('./env');
const { MalFun, MalNil, MalList, MalSymbol } = require('./types');

const handleDef = (ast, env, EVAL) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const handleLet = (ast, env, EVAL) => {
  const letEnv = new Env(env);
  const [bindings, ...forms] = ast.value.slice(1);

  for (let i = 0; i < bindings.value.length; i += 2) {
    letEnv.set(bindings.value[i], EVAL(bindings.value[i + 1], letEnv));
  }

  const doForms = new MalList([new MalSymbol('do'), ...forms]);
  return [doForms, letEnv];
};

const handleDo = (ast, env, EVAL) => {
  const rest = ast.value.slice(1);
  for (let i = 0; i < rest.length - 1; i++) {
    EVAL(rest[i], env);
  }
  return rest.slice(-1)[0];
};

const handleIf = (ast, env, EVAL) => {
  const [, cond, thenExp, elseExp] = ast.value;

  const predicate = EVAL(cond, env);
  if (predicate.value !== false && !(predicate instanceof MalNil)) {
    return thenExp;
  }
  if (elseExp === undefined) {
    return new MalNil();
  }
  return elseExp;
};

const handleFun = (ast, env, EVAL) => {
  const [, binds, ...exprs] = ast.value;
  const doForms = new MalList([new MalSymbol('do'), ...exprs]);
  return new MalFun(doForms, binds.value, env);
};

module.exports = { handleDef, handleLet, handleDo, handleIf, handleFun };
