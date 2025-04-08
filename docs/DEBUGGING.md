# Debugging

The service could be initialized with logger object which provides
methods trace, debug, info, warn a error. The OData library uses
debug and info now. If you would like just send output to the stdout
you can use [console](https://nodejs.org/dist/latest-v10.x/docs/api/console.html)
object provided by the NodeJS.

```javascript
	let service = new Service({
		"logger": console
	});
```

## Logging output to files

You can use [Console](https://nodejs.org/dist/latest-v10.x/docs/api/console.html#console_class_console)
class for output to the files also.

```javascript
	const outputStdFile = fs.createWriteStream('./stdout.log');
	const outputErrOutput = fs.createWriteStream('./stderr.log');

	let service = new Service({
		"logger": new Console({
			"stdout" : outputStdFile,
			"stderr" : outputErrOutput
		})
	});
```

## Define custom logger

You can define your own logger object.

```javascript
	const logger = {
		"trace": () => {},
		"debug": console.debug,
		"info": console.info,
		"warn": console.warn,
		"error": console.error
	};

	let service = new Service({
		"logger": logger
	});
```