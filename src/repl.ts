import * as prompt from "prompt-sync";
import { parser } from "./parser";
import * as vm from "vm";
import { error } from "console";
let build: string = "";
export const repl = () => {
    const line = prompt()(">");
    if (line == ".clear") {
        console.clear();
    } if(line == ".wipe") {
        build = ""
    } else {
        build += parser(line) + ";";
        build = build.replace(/;+/g, ";")
        try {
            const hi = vm.compileFunction(build.replace(/;+/g, ";"));
            hi();
        } catch (err) {
            console.log("ERROR: " + err.name + ": " + err.message);
            build = build.replace(parser(line) + ";", "");
        }
        build = build.replace(/^console\.log\((.*)\)$/, "");
    }
};
