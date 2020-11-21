import prompt from "prompt-sync";
import { parser } from "./parser";
import * as vm from "vm";
import { error } from "console";
let build: string = "";
export const repl = () => {
    const line = prompt()(">");
    if (line == ".clear") {
        console.clear();
    } else {
        build += parser(line) + ";";
        try {
            const hi = vm.compileFunction(build);
            hi();
        } catch (err) {
            console.log("ERROR: " + err.name + ": " + err.message);
            build = build.replace(parser(line) + ";", "");
        }

        build = build.replace(/console\.log\((.*)\)/, "");
    }
};
