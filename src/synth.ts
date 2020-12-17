import { exit } from "process";
import { parser } from "./parser";
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

export const synth = (tok: any, declared: Array<any>) => {
    let line: string = "";
    let numb: number = tok.error.split(":")[2];
    if (tok.typeOf == "func" && tok.decType != undefined) {
        if (tok.decType != "const") {
            console.log(
                tok.error +
                    "expected type declaration type of const for a function. Instead got type declaration of mutable"
            );
            exit();
        }

        line = `const ${tok.name} = `;
        tok.body.forEach((t: any) => {
            line += synth(t, declared);
        });
        declared.push(tok.name);
        return line;
    }
    if (tok.decType != undefined) {
        tok.body.forEach((t: any) => {
            line += synth(t, declared);
        });

        return `${tok.decType} ${tok.name} = ${line}`;
    }
    if (tok.typeOf == "func" && tok.decType == undefined) {
        tok.params.split("").forEach((p: string) => {
            line += " " + p + " => ";
        });
        tok.body.forEach((t: any) => {
            line += synth(t, declared).trim() + ";";
        });
        if (tok.bodyType == "block") {
            line += "};";
        } else {
            line += ";";
        }
        return line;
    }
    if (tok.typeOf == "cond") {
        let params = tok.params
            .filter((p: string) => p != undefined)
            .filter((p: string) => p.trim().length != 0);
        let paramString: string = "";
        params.forEach((p: string) => {
            paramString += synth(parser(p, numb), declared);
        });
        let True = synth(tok.body[0], declared);
        let False = synth(tok.body[1], declared);
        return `(${paramString}) ? ${True} : ${False}`;
    }
    if (tok.typeOf == "module") {
        return tok.body;
    }
    if (tok.typeOf == "block") {
        line = "{";
        return line;
    }
    if (tok.typeOf == "funcCall") {
        let params: string = ``;
        if (declared.filter((d) => d.name == tok.fnName).length == 0) {
            console.log("Undefined function " + tok.fnName);
            exit();
        }
        tok.params.forEach((p: string, i: number) => {
            if (i == tok.params.length - 1) {
                params += synth(parser(p, numb), declared);
            } else {
                params += synth(parser(p, numb), declared) + ",";
            }
        });
        return `${tok.fnName}(${params});`;
    }
    if (tok.typeOf == "builtin") {
        let param: string = synth(tok.body, declared);
        return `console.log(${param})`;
    }
    if (tok.typeOf == "unknown") {
        if (tok.body.match(/{(.*)}/)) {
            const funcs = tok.body.match(/{(.*)}/g);
            funcs.forEach((start: RegExpMatchArray) => {
                start = tok.body.match(/{(.*)}/);
                const func = toMatch(
                    "{",
                    "}",
                    tok.body.substring(start.index, tok.body.length)
                );
                const NewFunc = synth(parser(`{${func}}`, numb), declared);
                tok.body = tok.body.replace(
                    new RegExp(`{${func}}`, "g"),
                    NewFunc
                );
            });
        } else if (tok.body.match(/^\w$/)) {
            if (declared.filter((v) => v.name == tok.body.trim()).length == 0) {
                console.log(tok.body.trim() + " is undefined");
                exit();
            }
        }
        return tok.body;
    }
    if (tok.typeOf == "number") {
        return tok.body;
    }
};
