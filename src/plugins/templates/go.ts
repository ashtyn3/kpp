export default {
    name: "golang",
    template: {
        call: "{{name}}({{params}}",
        function: "func {{name}}({{params}}){{{body}}}",
        return: "return {{body}}",
    },
    // hi
};
