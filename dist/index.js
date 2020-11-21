"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// parser
var fs = __importStar(require("fs"));
var parser = function (line) {
    var statement = "";
    if (line.includes("->") && !line.startsWith("mut")) {
        var spaceless = line.split(" ");
        var defmark = line.indexOf("->");
        var value = spaceless.join(" ").substring(defmark + 2);
        value = parser(value);
        statement += "const " + spaceless[0].trim() + " =" + value;
        return statement;
    }
    else if (line.includes("->") && line.startsWith("mut")) {
        line = line.replace("mut", "").trim();
        var spaceless = line.split(" ");
        var defmark = line.indexOf("->");
        var value = spaceless.join(" ").substring(defmark + 2);
        value = parser(value);
        statement += "let " + spaceless[0].trim() + " =" + value;
        return statement;
    }
    else if (line.trim().startsWith("lam")) {
        var funcStart = line.indexOf(".");
        var keyword = line.indexOf("lam");
        var params = line.substring(keyword + 3, funcStart).trim();
        params.split("").forEach(function (p) {
            statement += " " + p + " =>";
        });
        statement = statement.trim();
        var body = line.substring(funcStart + 1).trim();
        statement += " " + parser(body);
        return statement;
    }
    else if (line.trim().startsWith("(")) {
        line = line.trim();
        // /,(?![^(]*\))/
        var chars = line.split("");
        var count = 0;
        var end = 0;
        for (var index = 0; index < chars.length; index++) {
            if (chars[index] == ")")
                count--;
            if (chars[index] == "(")
                count++;
            if (chars[index] == ")" && count == 0) {
                end = index;
                line = line.substring(1, end).trim();
            }
        }
        var name_1 = line.split(" ")[0];
        statement += name_1;
        var params = line.substring(line.indexOf(name_1) + name_1.length, end);
        params = params.trim();
        if (name_1 == "print") {
            statement = "console.log(" + parser(params) + ")";
            return statement;
        }
        params.split(/,(?![^(]*\))/).forEach(function (z) {
            // console.log(z);
            statement += "(" + parser(z) + ")";
        });
        return statement;
    }
    else {
        return line;
    }
};
var file = fs.readFileSync(process.argv[2], "utf-8");
var built = "";
file.split("\n").forEach(function (l) {
    if (!l.includes(";")) {
        var line = parser(l) + ";";
        built += line;
    }
    else {
        var line = parser(l);
        built += line;
    }
});
fs.writeFileSync(process.argv[2].split(".")[0] + ".js", built);
