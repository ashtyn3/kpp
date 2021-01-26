export default () => {
  let body: string = "";
  let scope: any = [];
  const names: Array<string> = Object.getOwnPropertyNames(Math);

  names.forEach((n: string) => {
    const func = `const ${n} = (...args) => Math.${n}(...args);`;
    scope.push({
      name: n,
      typeOf: "native",
      error: "Error:Native code: ",
      body: func,
    });
  });

  return { scope };
};
