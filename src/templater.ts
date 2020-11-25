import { fstat, readFileSync } from "fs";
import { exit } from "process";
import { slmTree } from "./asm-compiler";
import lang from "./plugins/templates/main";
interface template {
    call: string;
    function: string;
    return: string;
}
interface language {
    name: string;
    template: template;
}
export const toLang = (name: string, tree: Array<slmTree>) => {
    let data: language = {};
    try {
        // console.log(data);
        data = lang[name];
    } catch (err) {
        console.log("That langauge is not supported");
        exit();
    }
    tree.forEach((item: any) => {
        if (item.type == "var") {
            if (item.inner.type == "func") {
                const funcWname = data.template.function.replace(
                    "{{name}}",
                    item.name
                );
                const funcWparams = funcWname.replace(
                    "{{params}}",
                    item.inner.params.join("")
                );
                const exp: any = tree.filter((d: any) => {
                    return d.id == item.inner.body;
                })[0];
                const funcWbody = funcWparams.replace(
                    "{{body}}",
                    exp.value.join("")
                );
                console.log(funcWbody);
            }
        }
    });
    // console.log(data);
};
