const math = (fnName: string) => {
  if (Math[fnName] != undefined) {
    return "Math.";
  } else {
    return null;
  }
};
