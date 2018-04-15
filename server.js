const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const compress = require('compression');

// If an incoming request uses
// a protocol other than HTTPS,
// redirect that request to the
// same url but with HTTPS
const forceSSL = function () {
  return function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
  }
}

// Instruct the app
// to use the forceSSL
// middleware
// app.use(forceSSL());

// Should be placed before express.static
app.use(compress({
  filter: function (req, res) {
    return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'));
  },
  level: 9
}));

app.use(cors());
// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + '/dist'));

app.use(function (req, res, next) {
  res.setHeader('Cache-Control', 'public, max-age=31557600');
});

// For all GET requests, send back index.html
// so that PathLocationStrategy can be used
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname + '/dist/index.html'));
});

// Start the app by listening on the default
// Heroku port
app.listen(process.env.PORT || 8080);
