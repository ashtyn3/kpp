// parser
import * as crypto from "crypto";
import { include } from "./module";
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

export const parser = (line: string, scope?: string): any => {
    let statement = "";
    if (
        line.includes("->") &&
        !line.startsWith("mut") &&
        !line.startsWith("?")
    ) {
        const spaceless: Array<string> = line.split(" ");
        const defmark: number = line.indexOf("->");
        let value: string = spaceless.join(" ").substring(defmark + 2);
        value = parser(value.trim());
        statement += "const " + spaceless[0].trim() + " =" + value;
        return statement;
    } else if (line.startsWith("include")) {
        const name: string = line.split(" ")[1];
        statement += include(name, parser);
        return statement;
    } else if (line.startsWith("[")) {
        line = toMatch("[", "]", line);
        let arr: string = "[";
        line.split(",").forEach((i, index) => {
            if (index == line.split(",").length - 1) {
                console.log(i);
                arr += parser(i) + "]";
            } else {
                arr += parser(i) + ",";
            }
        });
        return arr;
    } else if (line.includes("->") && line.startsWith("mut")) {
        line = line.replace("mut", "").trim();
        const spaceless: Array<string> = line.split(" ");
        const defmark: number = line.indexOf("->");
        let value: string = spaceless.join(" ").substring(defmark + 2);
        value = parser(value);
        statement += "let " + spaceless[0].trim() + " =" + value;
        return statement;
    } else if (line.trim().startsWith("lam")) {
        const funcStart = line.indexOf(".");
        const keyword = line.indexOf("lam");
        const params = line.substring(keyword + 3, funcStart).trim();
        params.split("").forEach((p) => {
            statement += " " + p + " =>";
        });
        statement = statement.trim();
        const body = line.substring(funcStart + 1).trim();
        statement += " " + parser(body);
        return statement;
    } else if (line.trim().startsWith("?")) {
        const sp = line
            .trim()
            .split(/\?\s+(.*)\s*:(.*)\s*\!(.*)/)
            .filter((g) => g != "");
        statement = `(${sp[0]}) ? ${parser(sp[1].trim())} : ${parser(
            sp[2].trim()
        )}`;
        return statement;
    } else if (line.trim().startsWith("(")) {
        line = line.trim();
        // /,(?![^(]*\))/
        const chars: Array<string> = line.split("");
        let count: number = 0;
        let end: number = 0;
        for (let index = 0; index < chars.length; index++) {
            if (chars[index] == ")") count--;
            if (chars[index] == "(") count++;
            if (chars[index] == ")" && count == 0) {
                end = index;
                line = line.substring(1, end).trim();
            }
        }
        const name = line.split(" ")[0];
        statement += name;

        let params = line.substring(line.indexOf(name) + name.length, end);
        params = params.trim();
        if (name == "print") {
            statement = "console.log(" + parser(params) + ")";
            return statement;
        }
        params.split(/,(?![^(]*\))/).forEach((z: string) => {
            // console.log(z);
            statement += "(" + parser(z) + ")";
        });
        return statement;
    } else if (line.startsWith("block")) {
        return "{";
    } else {
        return line;
    }
};

export const parserToAsm = (line: string, scope?: string): string => {
    let statement = "";
    if (line.includes("->") && !line.startsWith("mut")) {
        const spaceless: Array<string> = line.split(" ");
        const defmark: number = line.indexOf("->");
        let value: string = spaceless.join(" ").substring(defmark + 2);
        value = parserToAsm(value, spaceless[0].trim());
        statement += "<var:const:" + spaceless[0].trim() + "\n" + value;
        return statement;
    } else if (line.includes("->") && line.startsWith("mut")) {
        line = line.replace("mut", "").trim();
        const spaceless: Array<string> = line.split(" ");
        const defmark: number = line.indexOf("->");
        let value: string = spaceless.join(" ").substring(defmark + 2);
        value = parserToAsm(value);
        statement += "<var:let:" + spaceless[0].trim() + "\n" + value;
        return statement;
    } else if (line.trim().startsWith("lam")) {
        const funcStart = line.indexOf(".");
        const keyword = line.indexOf("lam");
        const params = line.substring(keyword + 3, funcStart).trim();
        let formatParams = "";
        params.split("").forEach((p, num) => {
            if (num != params.length - 1) {
                formatParams += p + ",";
            } else {
                formatParams += p;
            }
        });
        statement = statement.trim();
        const body = line.substring(funcStart + 1).trim();
        const id = crypto.randomBytes(8).toString("hex");
        if (scope != undefined) {
            statement +=
                scope +
                ">func:" +
                formatParams +
                ":" +
                id +
                "\n" +
                parserToAsm(body, id);
        } else {
            statement += "<func:" + formatParams + "\n" + parserToAsm(body);
        }
        return statement;
    } else if (line.trim().startsWith("(")) {
        line = line.trim();
        // /,(?![^(]*\))/
        const chars: Array<string> = line.split("");
        let count: number = 0;
        let end: number = 0;
        for (let index = 0; index < chars.length; index++) {
            if (chars[index] == ")") count--;
            if (chars[index] == "(") count++;
            if (chars[index] == ")" && count == 0) {
                end = index;
                line = line.substring(1, end).trim();
            }
        }
        const buffer = crypto.randomBytes(8);

        const name = line.split(" ")[0];
        if (scope != undefined) {
            statement +=
                scope +
                ">" +
                "call:" +
                name +
                ":" +
                buffer.toString("hex") +
                "\n";
        } else {
            statement +=
                ">" + "call:" + name + ":" + buffer.toString("hex") + "\n";
        }

        let params = line.substring(line.indexOf(name) + name.length, end);
        params = params.trim();
        if (name == "print") {
            statement =
                "<builtin:print:" +
                buffer.toString("hex") +
                "\n" +
                parserToAsm(params, buffer.toString("hex"));
            return statement;
        }
        params.split(/,(?![^(]*\))/).forEach((z: string) => {
            // console.log(z);
            statement += parserToAsm(z, buffer.toString("hex")) + "\n";
        });

        return statement;
    } else {
        if (scope != undefined) {
            return scope + ">expr:" + line.trim();
        } else {
            return "<expr:" + line.trim();
        }
    }
};
