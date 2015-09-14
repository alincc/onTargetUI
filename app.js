var express = require("express");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var qs = require('querystring');
var methodOverride = require('method-override');
//var cors = require('cors');
var app = express();
var API_SERVER = 'http://localhost:9000/ontargetrs/services';

// Config
app.set('port', 3214);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride());
//app.use(cors());
app.use(express.static(__dirname + '/app'));

app.post('/ontargetrs/services*', function(req, res){
  //var r = request.post({headers: req.headers, uri: API_SERVER + req.params[0], json: req.body});
  //req.pipe(r).pipe(res);
  var url = API_SERVER + req.params[0];
  if(qs.stringify(req.query) !== "") {
    url += '?' + qs.stringify(req.query);
  }
  console.log(API_SERVER + req.params[0]);
  req.pipe(request({
    url: url,
    method: req.method,
    json: req.body//,
    //headers: req.headers
  }, function(error, response, body){
    if(error && error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else {
      throw error;
    }
  })).pipe(res);
});

app.get('/ontargetrs/services*', function(req, res){
  var url = API_SERVER + req.params[0];
  if(qs.stringify(req.query) !== "") {
    url += '?' + qs.stringify(req.query);
  }
  console.log(API_SERVER + req.params[0]);
  req.pipe(request({
    url: url,
    method: req.method//,
    //headers: req.headers
  }, function(error, response, body){
    if(error && error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else {
      throw error;
    }
  })).pipe(res);
});

app.get('/', function(req, res){
  res.sendfile("index.html");
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function(err){
  if(err) {
    console.error('uncaughtException: ' + err.message);
    console.error(err.stack);
    process.exit(1);             // exit with error
  }
});