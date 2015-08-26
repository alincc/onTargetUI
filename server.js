var express = require("express");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var myArgs = process.argv.slice(2);
var port = myArgs[0] || 3210;
var folder = myArgs[1] || 'src';
process.env.ROOT = __dirname + '/'+ folder;

// modules
var upload = require('./server/routes/upload')(app);
var xlsParser = require('./server/routes/xls-parser')(app);

// Config
app.set('port', port);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(process.env.ROOT));

// CORS
//app.all('/*', function(req, res, next) {
//  res.header('Access-Control-Allow-Credentials', true);
//  res.header('Access-Control-Allow-Origin', req.headers.origin);
//  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//  if('OPTIONS' == req.method) {
//    res.send(200);
//  } else {
//    next();
//  }
//  next();
//});

app.get('/', function(req, res) {
  res.sendfile("index.html");
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});