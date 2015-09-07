var connect = require('connect');
var serveStatic = require('serve-static');

var app = connect();

app.use(serveStatic(__dirname + '/app', {'index': ['index.html']}));
app.listen(9000);