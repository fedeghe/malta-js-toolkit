This plugin can be used on: **.js** files and even on **.coffee** and **.ts** files after using the right plugin

### Purpose  
Allows to enable some extra features on javascript code

### Options  

- __noConsole__    
disable all console functions, if `true` is passed  

- __lockScriptUrl__  
allows to lock the execution of the script if the `src` attribute of the script differs from the one passed (in this case use the generic protocol in the url passed)  

- __lockHostUrl__  
allows to lock the execution of the script if the host where the script is loaded differs from the one passed (even in this case use the generic protocol in the url passed)  

- __apiKey__ && __apiName__  
allows to specify key value and a variable name to execute the script execution only if in the global scope can be found a variable with the right value: e.g  
```
malta app/script.js public/js -plugins=malta-js-toolkit[apiName:\"secretKey\",apiKey:\"abcd1234\"]...malta-js-obfuscator
```
now whenever the resulting script will be loaded as
```html
<script>secretKey="abcd1234";</script>
<script src="js/script.js"></script>
```
il will execute only if a variable named _secretKey_ will contain exactly the value "abcd1234", otherwise the execution of _script.js_ will throw an exception.  
As in the example code, the resulting script should be obfuscated somehow, raising the effort needed to find a workaround.  

If not option is given the plugin won't modify the file/s interested

Sample usage:  
```
malta app/source/index.js public/js -plugins=malta-js-toolkit[noConsole:true,lockScriptUrl:\"//mydomain.com/js/app.js\",lockHostUrl:\"//mydomain.com\"]
```
in this case:  
- every console function will be disabled  
- the script execution will be locked but if  
	- the script `src` matches `/[https?:]?\/\/mydomain\.com\/js\/app\.js/`  AND  
	- the domain where is loaded matches `/[https?:]?\/\/mydomain\.com/`

or in the .json file :
```
"app/source/index.js" : "public/js -plugins=malta-js-toolkit[noConsole:true,lockScriptUrl:\'//mydomain.com/js/app.js\',lockHostUrl:\'//mydomain.com\',apiName:\'secretKey\',apiKey:\'abcd1234\']"
```
or in a script : 
``` js
var Malta = require('malta'),
    dynKey = "abcd1234";
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
