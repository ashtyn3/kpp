// parser
import * as crypto from "crypto";
//@ts-ignore
import * as math from "mathjs/number";
import { include } from "./module";
import * as chalk from "chalk";
const toMatch = (o: string, c: string, sample: string) => {
  let chars = sample.split("");
  let count: number = 0;
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (char == o) count++;
    if (char == c) count--;
    if (char == c && count == 0) {
      return sample.substring(0 + 1, i);
    }
  }
};
export const parser = (line: string, numb: number, scope?: string): any => {
  const errorTemp =
    chalk.redBright("Error:") + chalk.blueBright(numb) + chalk.reset() + ": ";
  let statement = "";
  if (line.includes("->") && !line.startsWith("mut") && !line.startsWith("?")) {
    if (scope != undefined) {
      console.log("Cannot declare variable in scope.");
    }
    const spaceless: Array<string> = line.split(" ");
    const defmark: number = line.indexOf("->");
    let value: any = spaceless.join(" ").substring(defmark + 2);
    value = parser(value.trim(), numb, spaceless[0].trim());
    // statement += "const " + spaceless[0].trim() + " =" + value;
    return {
      error: errorTemp,
      typeOf: value.typeOf,
      decType: "const",
      name: spaceless[0].trim(),
      bodyType: value.bodyType,
      body: [value],
    };
  } else if (line.startsWith("include")) {
    const name: string = line.split(" ")[1];
    const mod: any = include(name, parser);
    return {
      error: errorTemp,
      typeOf: "module",
      body: mod.body,
      scope: mod.scope,
    };
  } else if (line.startsWith("[")) {
    line = toMatch("[", "]", line);
    let arr: Array<any> = [];
    line.split(",").forEach((i, index) => {
      if (index == line.split(",").length - 1) {
        arr += parser(i, numb);
      } else {
        arr += parser(i, numb);
      }
    });
    return {
      typeOf: "array",
      body: arr,
    };
  } else if (line.includes("->") && line.startsWith("mut")) {
    line = line.replace("mut", "").trim();
    const spaceless: Array<string> = line.split(" ");
    const defmark: number = line.indexOf("->");
    let value: any = spaceless.join(" ").substring(defmark + 2);
    value = parser(value, numb);
    return {
      error: errorTemp,
      typeOf: value.typeOf,
      decType: "let",
      name: spaceless[0].trim(),
      bodyType: value.bodyType,
      body: [value],
    };
  } else if (line.trim().startsWith("lam")) {
    const funcStart = line.indexOf(".");
    const keyword = line.indexOf("lam");
    const params = line.substring(keyword + 3, funcStart).trim();
    params.split("").forEach((p) => {
      statement += " " + p + " =>";
    });
    //statement = statement.trim();
    const body = line.substring(funcStart + 1).trim();
    const val = parser(body, numb);
    //return statement;
    //if (scope != undefined) {
    return {
      typeOf: "func",
      params: params,
      bodyType: val.typeOf,
      error: errorTemp,
      body: [val],
    };
    //}
  } else if (line.trim().startsWith("?")) {
    const sp = line
      .trim()
      .split(/\?\s+(.*)\s*:\s*(.*)\s*\!\s*(.*)/)
      .filter((g) => g != "");
    if (!sp[2]) {
      statement = `(${sp[0]}) && ${parser(sp[1].trim(), numb)}`;
      return {
        error: errorTemp,
        typeOf: "cond",
        params: sp[0].split(
          /\s*(!|&&|\|\|)?\s*(\S+)\s*(==|&&|!=|>|<|<=|=>)\s*(\S+)\s*(!|&&|\|\|)?\s*/
        ),
        body: [parser(sp[1].trim(), numb)],
      };
    }
    statement = `(${sp[0]}) ? ${parser(sp[1].trim(), numb)} : ${parser(
      sp[2]?.trim(),
      numb
    )}`;
    return {
      error: errorTemp,
      typeOf: "cond",
      params: sp[0].split(
        /\s*(!|&&|\|\|)?\s*(\S+)\s*(==|&&|!=|>|<|<=|=>)\s*(\S+)\s*(!|&&|\|\|)?\s*/
      ),
      body: [parser(sp[1].trim(), numb), parser(sp[2]?.trim(), numb)],
    };
  } else if (line.trim().startsWith("{")) {
    line = line.trim();
    // /,(?![^(]*\))/
    const chars: Array<string> = line.split("");
    let count: number = 0;
    let end: number = 0;
    for (let index = 0; index < chars.length; index++) {
      if (chars[index] == "}") count--;
      if (chars[index] == "{") count++;
      if (chars[index] == "}" && count == 0) {
        end = index;
        line = line.substring(1, end).trim();
      }
    }
    const name = line.split(" ")[0];
    statement += name;

    let params = line.substring(line.indexOf(name) + name.length, end);
    params = params.trim();
    if (name == "print") {
      return {
        error: errorTemp,
        typeOf: "builtin",
        fnName: "print",
        body: parser(params, numb),
      };
    }
    const p = [];
    params.split(/,(?![^{]*\})/).forEach((z: string) => {
      p.push(z);
    });

    return {
      error: errorTemp,
      typeOf: "funcCall",
      params: p,
      fnName: name,
    };
  } else if (line.startsWith("block")) {
    return {
      error: errorTemp,
      typeOf: "block",
      body: [],
    };
  } else if (line.trim().match(/^[a-zA-z0-9_]:[a-zA-z0-9_]/g)) {
    const seq = line.split(":").map((a) => parser(a, numb));

    console.log(seq);
  } else {
    try {
      if (line.match(/\d+/) && !line.startsWith('"')) {
        return {
          error: errorTemp,
          typeOf: "number",
          body: [math.evaluate(line)],
        };
      } else {
        return {
          error: errorTemp,
          typeOf: "unknown",
          body: line,
        };
      }
    } catch (err) {
      if (line.trim().length != 0)
        return {
          error: errorTemp,
          typeOf: "unknown",
          body: line,
        };
    }
  }
};
