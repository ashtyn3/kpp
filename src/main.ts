import * as fs from "fs";
import { parser } from "./parser";
import { exec } from "child_process";
import { synth } from "./synth";
if (process.argv[2] == undefined) {
    //    while (true) {
    //        repl();
    //    }
} else {
    let file: string = fs.readFileSync(process.argv[2], "utf-8");

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
    console.log(tree.filter((t: any) => t.name != undefined));
    tree.forEach((t: any) => {
        built += synth(
            t,
            tree.filter((t: any) => t.name != undefined)
        );
    });

    console.log(built);
    fs.writeFileSync(
        process.argv[2].split(".")[0] + ".js",
        built.replace(/;+/g, ";")
    );
    const name: string = process.argv[2].split(".")[0] + ".js";
    exec(
        "qjsc " +
            name +
            " -o " +
            process.argv[2].split(".")[0] +
            " && rm " +
            process.argv[2].split(".")[0] +
            ".js",
        (error, _, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`${stderr}`);
            }
            console.log("successfully compiled " + process.argv[2]);
        }
    );
}
