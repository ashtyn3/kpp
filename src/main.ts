import * as fs from "fs";
import { parser } from "./parser";
import { repl } from "./repl";
if (process.argv[2] == undefined) {
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
