/**
 * Custom HTTP library wrapper/middleware
 * @author JA Clarke
 * @since 2011/04/26
 */
 
var Http  = require('http'),
    Https = require('https'),
    Url   = require('url');
    
function get(url, cb, headers) {
  request(url, false, 'GET', headers, cb);
}

function post(url, reqBody, headers, cb) {
  request(url, reqBody, 'POST', headers, cb);
}

function request(url, data, method, headers, cb) {
  var body    = '',
      url     = Url.parse(url),
      host    = url.hostname,
      path    = url.pathname,
      headers = headers ? headers : {},
      secure  = (url.protocol == 'https:') ? true : false,
      port    = url.port,
      client  = secure ? Https : Http,
      options, request;
  
  // Add the default HTTP headers
  headers['host'] = secure ? host + ":443" : host;
  headers['user-agent'] = 'my-node-server';
  
  // When posting data, add a data length header
  if(data) {
    headers['Content-Length'] = data.length + 1;
  }
  
  // Add query string if any
  if(url.search != undefined) {
    path += url.search;
  }
  
  // Create the request options in a object
  options = {
    host: host,
    port: port,
    path: path,
    method: method,
    headers: headers
  };
  // Perform the request operation
  request = client.request(options, function(response){
    response.setEncoding('utf8');
    response.on('data', function(chunk){
      body += chunk;
    });
    response.on('end', function(chunk){
      cb(null, response, body);
    });
  }).on('error', function(error){ // Error management
    console.log('HTTP request return error : ' + error.message);
    cb(error);
  });
  
  // Send the request
  if(data) {
    request.write(data);
  } else {
    request.end();
  }
}

function response(res, message, code, type) {
  var body = message,
      type = type ? type : 'text/html',
      code = code ? code : 200;
  res.writeHead(code, {'Content-Type' : type + ';charset=UTF-8', 'Content-Length' : body.length});
  if(body) {
    res.write(body);
  }
  res.end();
}

// Expose the functions to calling functions/libraries
exports.get = get;
exports.post = post;
exports.request = request;
exports.response = response;