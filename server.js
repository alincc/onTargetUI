var express = require("express");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cors = require('cors');
var app = express();
var myArgs = process.argv.slice(2);
var port = myArgs[0] || 9000;
var rootFolder = myArgs[2] ? __dirname + '/' + myArgs[2] : __dirname;
var env = myArgs[1] || 'nois';

GLOBAL.ROOTPATH = rootFolder;
GLOBAL.ENVIRONMENT = env;

// Config
app.set('port', port);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride());
app.use(cors());
app.use(express.static(rootFolder));

// Load utils
require('./server/utils');

// Initialize routes
require('./server/routes')(app);

// Initialize queues
require('./server/services/queue').init();

// Initialize pusher
require('./server/services/push').init();

//app.get('/', function(req, res){
//  res.sendFile("index.html");
//});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function(err) {
  if(err) {
    console.error('uncaughtException: ' + err.message);
    console.error(err.stack);
    //process.exit(1);             // exit with error
  }
});