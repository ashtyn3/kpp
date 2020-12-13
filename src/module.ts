import * as fs from "fs"

export const include = (name:string, parser: Function) => {
        let file:string = fs.readFileSync(name, "utf-8") 

        let built: string = "";
        file = file.replace(/#(.*)/g, "");
        let parsed: Array<string> = []
        file.split("\n").forEach((l) => {
            if(!parsed.includes(l)) {
                const line: string = parser(l) + ";";
                built += line;
                built = built.replace(/;+/g, ";")
            }
            parsed.push(l)
        });
        return built
}
