'use strict';

var a127 = require('a127-magic');
var express = require('express');
var basicAuth = require('basic-auth-connect');
var app = express();

module.exports = app; // for testing

// initialize a127 framework
a127.init(function(config) {
  app.use(basicAuth('username', 'password'));
  // include a127 middleware
  app.use(a127.middleware(config));

  app.use('/static', express.static('api/static'));

  // error handler to emit errors as a json string
  app.use(function(err, req, res, next) {
    if (typeof err !== 'object') {
      // If the object is not an Error, create a representation that appears to be
      err = {
        message: String(err) // Coerce to string
      };
    } else {
      // Ensure that err.message is enumerable (It is not by default)
      Object.defineProperty(err, 'message', { enumerable: true });
    }

    // Return a JSON representation of #/definitions/ErrorResponse
    res.set('Content-Type', 'text/javascript');
    res.end(JSON.stringify(err));
  });

  // var ip = process.env.IP || 'localhost';
  // var port = process.env.PORT || 10010;
  // begin listening for client requests
  // app.listen(port, ip);
  app.listen(process.env.PORT || 5000);
});
