import { randomBytes } from "crypto";
import { exit } from "process";

let scope: any = {};
const buildScope = () => {
    return scope;
};
export const asmParser = (input: string) => {
    input.split("\n").forEach((line, num) => {
        if (line.match(/(\S*)>([a-z]+):([a-z]+)(:\S*)?/)) {
            let split: Array<string> = line
                .trim()
                .split(/(\S*)>([a-z]+):([a-z]+)(:\S*)?/);
            split = split.filter((s: string) => {
                if (s != "") return s;
            });

            if (scope[split[0]] == undefined) {
                console.log(
                    "(undefined reference:" +
                        num +
                        ") unknown name " +
                        split[0] +
                        " with type " +
                        split[1]
                );
                exit();
            }
            // console.log(split[0]);
            // console.log(scope);
            scope[split[0]].inner.push(
                split[split.length - 1].replace(":", "")
            );
        } else if (line.match(/<([a-z]+):([a-z]+)?(:\S*)/)) {
            let split: Array<string> = line
                .trim()
                .split(/<([a-z]+):([a-z]+)?(:\S*)/);
            split = split.filter((s: string) => {
                if (s != "") return s;
            });
            console.log(split);
            scope[split[split.length - 1].replace(":", "")] = {
                type: split[0],
                name: split[1],
                inner: [],
            };
        }
    });
    return buildScope();
};
