//load dependencies and whatever needed
var path = require('path')
    fs = require('fs');

function js_toolkit(obj, options) {

    var self = this,
        start = new Date(),
        msg, label,
        pluginName = path.basename(path.dirname(__filename)),
        pre = '',
        tmp,
        lines;

    function microHash(str){var res = 0,i = 0,l = str.length;for (;i<l;i++) {res += '' + str.charCodeAt(i)*20091976;}return "="+res;}

    options = options || {};

    if ('noConsole' in options && options.noConsole) {
        pre += "console.log = console.dir = console.debug = console.warn = console.error = function () {};\n";
    }
    if ('noDebugger' in options && options.noDebugger) {

        lines = obj.content.split(/\;$/m);
        console.log(obj.content);
        console.log(lines);
        obj.content = lines.join(";\ndebugger;\n");
    }
    if ('lockScriptUrl' in options && options.lockScriptUrl) {
        tmp = microHash(options.lockScriptUrl);
        label = 'message' in options ? options.message : "NOT AUTHORIZED (not hostable)";
        pre += "\n/*---/ src lock \\---*/\n" + 
        '(function () {'+ "\n" +
            'var proceed = true,' + "\n"+
                'scripts = document.getElementsByTagName("script"),'+ "\n" +
                'l = scripts.length - 1,'+ "\n" +
                'script = "currentScript" in document ? document.currentScript : scripts[l],'+ "\n" +
                'scriptSRC = script.src.replace(/^https?:\\\/\\\/(www\\\.)?/, "//").replace(/\\\?.*/, "");'+ "\n" +
            ''+ "\n" +
            microHash.toString()+"\n" +
            'proceed = "' + tmp + '" === microHash(scriptSRC);'+ "\n" +
            'if (!proceed) throw new Error("' + label + '");' + "\n" +
        '})();' + "\n" +
        "/*---\\ src lock /---*/\n";
    }

    if ('lockHostUrl' in options && options.lockHostUrl) {
        tmp = microHash(options.lockHostUrl);
        label = 'message' in options ? options.message : "NOT AUTHORIZED (wrong host)";
        pre += "\n/*---/ host lock \\---*/\n"+
        '(function () {'+ "\n" +
            'var host = document.location.host,' + "\n" +
            '   auth = "' + tmp + '" == microHash(host.replace(/^https?:\\\/\\\/(www\\\.)?/, "//"));' + "\n" +
            microHash.toString()+"\n" +
            'if (!auth) throw new Error("' + label + '");' + "\n" +
        '})();' + "\n" +
        "/*---\\ host lock /---*/\n";
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
    }

    obj.content = pre + obj.content;

    return function (solve, reject) {

        fs.writeFile(obj.name, obj.content, function (err) {
            if (err == null) {
                msg = 'plugin ' + pluginName.white() + ' wrote ' + obj.name +' (' + self.getSize(obj.name) + ')';
            } else {
                console.log('[ERROR] js_toolkit says:');
                console.dir(err);
                self.stop();
            }
            solve(obj);
            self.notifyAndUnlock(start, msg);
        })
    }
}
js_toolkit.ext = ['js', 'coffee', 'ts'];

module.exports = js_toolkit;