import { randomBytes } from "crypto";
import { exit } from "process";

export interface slmTree {
    type: string;
    name: string;
    inner: Array<string>;
}

let scope: any = {};
const buildScope = () => {
    let tree: Array<slmTree> = [];
    Object.keys(scope).forEach((k) => {
        tree.push(scope[k]);
    });
    return tree;
};
export const asmParser = (input: string) => {
    input.split("\n").forEach((line, num) => {
        if (line.match(/(\S*)>([a-z]+):(\S+)(:(\S*))?/)) {
            let split: Array<string> = line
                .trim()
                .split(/(\S*)>([a-z]+):(\S+)(:(\S*))?/);
            split = split.filter((s: string) => {
                if (s != "" || s != undefined) return s;
            });

            if (scope[split[0]] == undefined) {
                scope[split[0]] = {
                    type: split[1],
                    id: split[0],
                    value: [split[split.length - 1].replace(":", "")],
                };
                // console.log(
                //     "(undefined reference:" +
                //         num +
                //         ") unknown name " +
                //         split[0] +
                //         " with type " +
                //         split[1]
                // );
                // exit();
            } else {
                scope[split[0]].inner = {
                    type: split[1],
                    params: [split[split.length - 1].split(":")[0]],
                    body: split[split.length - 1].split(":")[1],
                };
            }
        } else if (line.match(/<([a-z]+):([a-z]+)?(:\S*)/)) {
            let split: Array<string> = line
                .trim()
                .split(/<([a-z]+):([a-z]+)?(:\S*)/);
            split = split.filter((s: string) => {
                if (s != "") return s;
            });
            scope[split[split.length - 1].replace(":", "")] = {
                type: split[0],
                name: split[split.length - 1].replace(":", ""),
                inner: [],
            };
        }
    });
    return buildScope();
};
