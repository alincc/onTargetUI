var express = require("express");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var qs = require('querystring');
var methodOverride = require('method-override');
var cors = require('cors');
var app = express();
var myArgs = process.argv.slice(2);
var port = myArgs[0] || 9000;
var folder = myArgs[1];

//process.env.ROOT = __dirname + '/' + folder;
if(folder) {
  process.env.ROOT = __dirname + '/' + folder;
} else {
  process.env.ROOT = __dirname;
}

// Config
app.set('port', port);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride());
app.use(cors());
app.use(express.static(process.env.ROOT));

// routes
var upload = require('./server/routes/upload')(app);
var download = require('./server/routes/download')(app);
var xlsParser = require('./server/routes/xls-parser')(app);
var move = require('./server/routes/move')(app);
var googleDriveFiles = require('./server/routes/googleDriveFile')(app);
var boxFiles = require('./server/routes/boxFile')(app);
var dropBoxFiles = require('./server/routes/dropBoxFile')(app);

// modules
var pushModule = require('./server/modules/push')(app);

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