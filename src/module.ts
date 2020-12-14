import * as fs from "fs";

export const include = (name: string, parser: Function) => {
    let file: string = fs.readFileSync(name, "utf-8");
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

    return built;
};
