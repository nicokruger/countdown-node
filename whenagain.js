var winston = require("winston");

if (typeof(winston.loggers.options.transports) === "undefined") winston.loggers.options.transports = [];
winston.loggers.options.transports.push(new (winston.transports.File)({ filename: 'whenagain.log', timestamp: true, json:false }));

var server = require("./js/server").server({
	paginationLimit:4,
	serverPort: 8081
});

server.listen();
