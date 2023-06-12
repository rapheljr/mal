const { Env } = require('./env');
const {
  MalFun,
  MalNil,
  MalList,
  MalSymbol,
  MalMap,
  MalVector,
} = require('./types');

const handleDef = (ast, env, EVAL) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1]);
};

const handleDefMac = (ast, env, EVAL) => {
  const macro = EVAL(ast.value[2], env);
  macro.isMacro = true;
  env.set(ast.value[1], macro);
  return env.get(ast.value[1]);
};

const isMacroCall = (ast, env) => {
  try {
    return (
      ast instanceof MalList &&
      !ast.isEmpty() &&
      ast.value[0] instanceof MalSymbol &&
      env.get(ast.value[0]).isMacro
    );
  } catch (error) {
    return false;
  }
};

const macroExpand = (ast, env) => {
  while (isMacroCall(ast, env)) {
    const macro = env.get(ast.value[0]);
    ast = macro.apply(null, ast.value.slice(1));
  }
  return ast;
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
  const [, cond, ifExp, elseExp] = ast.value;

  const predicate = EVAL(cond, env);
  if (predicate.value !== false && !(predicate instanceof MalNil)) {
    return ifExp;
  }
  return elseExp || new MalNil();
};

const handleFun = (ast, env, EVAL) => {
  const [, binds, ...exprs] = ast.value;
  const doForms = new MalList([new MalSymbol('do'), ...exprs]);
  const fun = (...args) => {
    const funEnv = new Env(env, binds.value, args);
    return EVAL(doForms, funEnv);
  };
  return new MalFun(doForms, binds.value, env, fun);
};

const beginsWith = (ast, symbol) =>
  ast instanceof MalList && ast.beginsWith(symbol);

const getResult = (ast) => {
  let result = new MalList([]);
  for (let index = ast.value.length - 1; index >= 0; index--) {
    const elt = ast.value[index];
    if (beginsWith(elt, 'splice-unquote')) {
      result = new MalList([new MalSymbol('concat'), elt.value[1], result]);
    } else {
      result = new MalList([new MalSymbol('cons'), handleQQ(elt), result]);
    }
  }
  return result;
};

const handleQQ = (ast) => {
  if (beginsWith(ast, 'unquote')) return ast.value[1];
  if (ast instanceof MalSymbol || ast instanceof MalMap)
    return new MalList([new MalSymbol('quote'), ast]);
  if (ast instanceof MalList) {
    return getResult(ast);
  }
  if (ast instanceof MalVector) {
    return new MalList([new MalSymbol('vec'), getResult(ast)]);
  }
  return ast;
};

module.exports = {
  handleDef,
  handleLet,
  handleDo,
  handleIf,
  handleFun,
  handleQQ,
  handleDefMac,
  isMacroCall,
  macroExpand,
};
