import { exit } from "process";
import { parser } from "./parser";
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
    if (tok.typeOf == "func" && tok.decType != undefined) {
        if (tok.decType != "const") {
            console.log(
                "expected type declaration type of const for a function. Instead got type declaration of mutable"
            );
            exit();
        }

        line = `const ${tok.name} = `;
        tok.body.forEach((t) => {
            line += synth(t, declared);
        });
        declared.push(tok.name);
        return line;
    }
    if (tok.decType != undefined) {
        tok.body.forEach((t) => {
            line += synth(t, declared);
        });

        return `${tok.decType} ${tok.name} = ${line}`;
    }
    if (tok.typeOf == "func" && tok.decType == undefined) {
        tok.params.split("").forEach((p) => {
            line += " " + p + " => ";
        });
        tok.body.forEach((t) => {
            line += synth(t, declared).trim() + ";";
        });
        if (tok.bodyType == "block") {
            line += "};";
        } else {
            line += ";";
        }
        return line;
    }
    if (tok.typeOf == "block") {
        line = "{";
        return line;
    }
    if (tok.typeOf == "funcCall") {
        let params: string = "";
        if (declared.filter((d) => d.name == tok.fnName).length == 0) {
            console.log("Undefined function " + tok.fnName);
            exit();
        }
        tok.params.forEach((p, i) => {
            if (i == tok.params.length - 1) {
                params += synth(parser(p), declared);
            } else {
                params += synth(parser(p), declared) + ",";
            }
        });
        return `${tok.fnName}(${params})`;
    }
    if (tok.typeOf == "builtin") {
        let param: string = synth(tok.body, declared);
        return `console.log(${param});`;
    }
    if (tok.typeOf == "unknown") {
        if (tok.body.match(/{(.*)}/)) {
            const funcs = tok.body.match(/{(.*)}/g);
            funcs.forEach((start) => {
                start = tok.body.match(/{(.*)}/);
                const func = toMatch(
                    "{",
                    "}",
                    tok.body.substring(start.index, tok.body.length)
                );
                const NewFunc = synth(parser(`{${func}}`), declared);
                tok.body = tok.body.replace(
                    new RegExp(`{${func}}`, "g"),
                    NewFunc
                );
            });
        }

        return tok.body;
    }
    if (tok.typeOf == "number") {
        return tok.body;
    }
};
