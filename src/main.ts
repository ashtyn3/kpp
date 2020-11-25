import * as fs from "fs";
import { asmParser } from "./asm-compiler";
import { parser, parserToAsm } from "./parser";
import { repl } from "./repl";
if (process.argv[2] == "-toAsm") {
    let file: string = fs.readFileSync(process.argv[3], "utf-8");

    let built: string = "";
    file = file.replace(/#(.*)/g, "");
    file.split("\n").forEach((l) => {
        const line: string = parserToAsm(l) + "\n";
        built += line;
    });
    fs.writeFileSync(process.argv[3].split(".")[0] + ".slm", built);
} else if (process.argv[2] == "-asm") {
    let file: string = fs.readFileSync(process.argv[3], "utf-8");
    console.log(asmParser(file));
} else if (process.argv[2] == undefined) {
    while (true) {
        repl();
    }
} else {
    let file: string = fs.readFileSync(process.argv[2], "utf-8");

    let built: string = "";
    file = file.replace(/#(.*)/g, "");
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
}
