---
[![npm version](https://badge.fury.io/js/malta-js-toolkit.svg)](http://badge.fury.io/js/malta-js-toolkit)
[![Dependencies](https://david-dm.org/fedeghe/malta-js-toolkit.svg)](https://david-dm.org/fedeghe/malta-js-toolkit)
[![npm downloads](https://img.shields.io/npm/dt/malta-js-toolkit.svg)](https://npmjs.org/package/malta-js-toolkit)
[![npm downloads](https://img.shields.io/npm/dm/malta-js-toolkit.svg)](https://npmjs.org/package/malta-js-toolkit)  
---  

This plugin can be used on: **.js** files and even on **.coffee** and **.ts** files after using the right plugin

### Purpose  
Allows to enable some extra features on javascript code

### Options  

- __noConsole__    
disable all console functions, if `true` is passed  

- __lockScriptUrl__ (*)  
allows to lock the execution of the script if the `src` attribute of the script differs from the one passed (in this case use the generic protocol in the url passed)  

- __lockHostUrl__ (*)  
allows to lock the execution of the script if the host where the script is loaded differs from the one passed (even in this case use the generic protocol in the url passed)  

- __apiKey__ && __apiName__ (*)  
allows to specify key value and a variable name to execute the script execution only if in the global scope can be found a variable with the right value.

(*) it is possible to use an additional `message` parameter to overwrite the default failure message that will appear in the browser console.  

If not option is given the plugin won't modify the file/s interested

Sample usage:  
```
malta app/source/index.js public/js -plugins=malta-js-toolkit[noConsole:true,lockScriptUrl:\"//mydomain.com/js/app.js\",lockHostUrl:\"//mydomain.com\",apiName:\"secretKey\",apiKey:\"foofoo\"]
```
in this case:  
- every console function will be disabled  
- the script execution will be locked but if all the following conditions are met  
	- the script `src` matches `/[https?:]?\/\/mydomain\.com\/js\/app\.js/`  
	- the domain where is loaded matches `/[https?:]?\/\/mydomain\.com/`
    - at execution can be found a variable named `secretKey` in the global scope containing the value `foofoo`

or in the .json file :
```
"app/source/index.js" : "public/js -plugins=malta-js-toolkit[noConsole:true,lockScriptUrl:\'//mydomain.com/js/app.js\',lockHostUrl:\'//mydomain.com\',apiName:\'secretKey\',apiKey:\'foofoo\']"
```
or in a script : 
``` js
var Malta = require('malta'),
    dynKey = "foofoo";
Malta.get().check([
    'app/source/index.js',
    'public/js',
    '-plugins=malta-js-toolkit',
    '-options=noConsole:true,lockScriptUrl:"//mydomain.com/js/app.js",lockHostUrl:"//mydomain.com",apiName:"secretKey",apiKey:"' + dynKey + '"'
    ]).start(function (o) {
        var s = this;
        console.log('name : ' + o.name)
        console.log("content : \n" + o.content);
        'plugin' in o && console.log("plugin : " + o.plugin);
        console.log('=========');
    });
```
Since the locking of the execution is done with a very simple hash function it is strongly recommended to obfuscate everything using (after [malta-js-toolkit][0]) the [malta-js-obfuscator][1] plugin.


[0]: https://www.npmjs.com/package/malta-js-toolkit
[1]: https://www.npmjs.com/package/malta-js-obfuscator
