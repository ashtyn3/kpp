// parser
import * as fs from "fs";

const parser = (line: string): string => {
    let statement = "";

    if (line.includes("->") && !line.startsWith("mut")) {
        const spaceless: Array<string> = line.split(" ");
        const defmark: number = line.indexOf("->");
        let value: string = spaceless.join(" ").substring(defmark + 2);
        value = parser(value);
        statement += "const " + spaceless[0].trim() + " =" + value;
        return statement;
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
    } else {
        return line;
    }
};
const file = fs.readFileSync(process.argv[2], "utf-8");

let built = "";

file.split("\n").forEach((l) => {
    if (!l.includes(";")) {
        const line: string = parser(l) + ";";
        built += line;
    } else {
        const line: string = parser(l);
        built += line;
    }
});

fs.writeFileSync(process.argv[2].split(".")[0] + ".js", built);
