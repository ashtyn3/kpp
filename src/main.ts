import * as fs from "fs";
import { asmParser } from "./asm-compiler";
import { parser, parserToAsm } from "./parser";
import { repl } from "./repl";
import { toLang } from "./templater";
if (process.argv[2] == "-toAsm") {
    let file: string = fs.readFileSync(process.argv[3], "utf-8");

    let built: string = "";
    file = file.replace(/#(.*)/g, "");
    file.split("\n").forEach((l) => {
        const line: string = parserToAsm(l) + "\n";
        built += line;
    });
    fs.writeFileSync(process.argv[3].split(".")[0] + ".kppm", built);
} else if (process.argv[2] == "-asm") {
    let file: string = fs.readFileSync(process.argv[3], "utf-8");
    toLang("go", asmParser(file));
    // console.log("zoom");
} else if (process.argv[2] == undefined) {
    while (true) {
        repl();
    }
} else {
    let file: string = fs.readFileSync(process.argv[2], "utf-8");

    let built: string = "";
    file = file.replace(/#(.*)/g, "");
    let parsed: Array<string> = [];
    file.split("\n").forEach((l, i) => {
        if (!parsed.includes(l)) {
            if (
                parser(l) == "{" ||
                l.trim().startsWith("|") ||
                l.trim().endsWith("block")
            ) {
                if (parser(l) == "{") {
                    built += "{";
                } else if (!file.split("\n")[i + 1].trim().startsWith("|")) {
                    built += parser(l.replace("|", "")) + "};";
                } else {
                    built += parser(l.replace("|", "")) + "\n";
                }
            } else {
                const line: string = parser(l) + ";";
                built += line;
            }
        }
        parsed.push(l);
    });

    fs.writeFileSync(
        process.argv[2].split(".")[0] + ".js",
        built.replace(/;+/g, ";")
    );
}
