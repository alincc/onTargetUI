var path = require('path');
var fs = require("fs");
var rootPath = process.env.ROOT;
var mime = require('mime');

function downloadFile(req, res) {
  var url = req.query.url,
    file = rootPath + '/' + url,
    fileName = path.basename(file);

  if(fs.existsSync(file)) {
    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    res.setHeader('Content-type', mime.lookup(fileName.substring(fileName.lastIndexOf('.') + 1)));

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
  }
  else{
    res.status(404)        // HTTP status 404: NotFound
      .send('File not found');
  }
}

module.exports = function(app) {
  app.get('/download/file', downloadFile);
};