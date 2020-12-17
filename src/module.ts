import * as fs from "fs";
import { synth } from "./synth";

export const include = (name: string, parser: Function) => {
    let file: string = fs.readFileSync(name, "utf-8");
    let built: string = "";
    file = file.replace(/#(.*)/g, "");
    let tree: Array<any> = [];
    file.split("\n").forEach((l, i) => {
        if (l.trim().endsWith("block") || l.trim().startsWith("|")) {
            if (l.trim().endsWith("block")) {
                tree.push(parser(l, i + 1));
            }
            if (l.trim().startsWith("|")) {
                const item = parser(l.replace("|", ""), i + 1);
                tree[tree.length - 1].body[0].body.push(item);
            }
        } else {
            tree.push(parser(l, i + 1));
        }
    });
    tree.forEach((t: any) => {
        built += synth(
            t,
            tree.filter((t: any) => t.name != undefined)
        );
    });

    return built;
};
