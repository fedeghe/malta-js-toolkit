const path = require('path')
    fs = require('fs');

function js_toolkit(obj, options) {

    const self = this,
        start = new Date(),
        pluginName = path.basename(path.dirname(__filename));
    let msg, label,
        pre = '',
        tmp,
        lines;

    function microHash(str) {
        var res = '',
            i = 0,
            l = str.length;
        while (i < l) {
            res += str.charCodeAt(i++) * 100003 * (i + 1);
        }
        return "="+res;
    }

    options = options || {};

    if ('noConsole' in options && options.noConsole) {
        pre += "console.log = console.dir = console.debug = console.warn = console.error = function () {};\n";
    }
    if ('noDebugger' in options && options.noDebugger) {
        lines = obj.content.split(/debugger;?/m);
        obj.content = lines.join("");
    }
    if ('lockScriptUrl' in options && options.lockScriptUrl) {
        tmp = microHash(options.lockScriptUrl);
        label = 'message' in options ? options.message : "NOT AUTHORIZED (not hostable)";

        pre += `
/*---/ src lock \\---*/
(function () {
    var proceed = true,
        scripts = document.getElementsByTagName("script"),
        l = scripts.length - 1,
        script = "currentScript" in document ? document.currentScript : scripts[l],
        scriptSRC = script.src.replace(/^https?:\\\/\\\/(www\\\.)?/, "//").replace(/\\\?.*/, "");
    
    ${microHash.toString()}
    proceed = "${tmp}" === microHash(scriptSRC);
    if (!proceed) throw new Error("${label}");
})();
/*---\\ src lock /---*/
`;
    }

    if ('lockHostUrl' in options && options.lockHostUrl) {
        tmp = microHash(options.lockHostUrl);
        label = 'message' in options ? options.message : "NOT AUTHORIZED (wrong host)";

        pre += `
/*---/ host lock \\---*/
(function () {
    var host = document.location.host,
        auth = "${tmp}" == microHash(host.replace(/^https?:\\\/\\\/(www\\\.)?/, "//"));
    ${microHash.toString()}
    if (!auth) throw new Error("${label}");
})();
/*---\\ host lock /---*/
`;
    }

    if (
        'keyApi' in options && options.keyApi
        &&
        'nameApi' in options && options.nameApi
    ) {
        tmp = microHash(options.keyApi);
        label = 'message' in options ? options.message : "NOT AUTHORIZED (wrong apikey)";
        pre += "\n/*---/ api lock \\---*/\n"+
        '(function () {'+ "\n" +
            '!("' + options.nameApi + '" in window) && lock();' + "\n" +
            'var auth = "' + tmp + '" == microHash(' + options.nameApi + ');' + "\n" +
            microHash.toString()+"\n" +
            '!auth && lock();' + "\n" +
            'function lock() {throw new Error("' + label + '");}' +  "\n" +
        '})();' + "\n" +
        "/*---\\ api lock /---*/\n";

        pre += `
/*---/ api lock \\---*/
(function () {
    !("${options.nameApi}" in window) && lock();
    var auth = "${tmp}" == microHash(${options.nameApi});
    ${microHash.toString()}
    !auth && lock();
    function lock() {throw new Error("${label}");}
})();
/*---\\ api lock /---*/
`;
    }

    obj.content = pre + obj.content;

    return (solve, reject) => {

        fs.writeFile(obj.name, obj.content,  err => {
            if (err == null) {
                msg = 'plugin ' + pluginName.white() + ' wrote ' + obj.name +' (' + self.getSize(obj.name) + ')';
            } else {
                self.doErr(err, o, pluginName);
            }
            err
                ? reject(`Plugin ${pluginName} error: ${err}`)
                : solve(obj);
            self.notifyAndUnlock(start, msg);
        })
    }
}
js_toolkit.ext = ['js', 'coffee', 'ts'];

module.exports = js_toolkit;