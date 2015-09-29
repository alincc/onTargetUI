var path = require('path');
var fs = require("fs");
var request = require('request');
var mkdirp = require("mkdirp");
var mime = require('mime');
//var cors = require('cors');
var config = require('./../config');

// paths/constants
var uploadedFilesPath = config.uploadedFilesPath,
  imagePathRoot = config.imagePathRoot;

function downloadFile(req, res) {
  var responseData = {
    success: false
  };
  var url = req.body.url;
  var uuid = req.body.uuid;
  var fileName = req.body.fileName.replace(/\s/g,'_');
  var destinationDir = uploadedFilesPath + 'temp/';
  var fileDestination = destinationDir + fileName;

  function success() {
    responseData.success = true;
    responseData.url = imagePathRoot + "temp/" + fileName;
    responseData.name = fileName;
    responseData.type = mime.lookup(fileName.substring(fileName.lastIndexOf('.') + 1));
    res.send(responseData);
  }

  function error(err) {
    responseData.error = err;
    res.send(responseData);
  }

  mkdirp(destinationDir, function(er) {
    if(er) {
      error(er);
    }
    else {
      var writeStream = fs.createWriteStream(fileDestination);

      writeStream.on('finish', success);

      writeStream.on('error', error);

      var readStream = request.get(url);

      readStream.on('error', error);

      readStream.pipe(writeStream);
    }
  });
}

module.exports = function(app) {
  app.post('/node/download', downloadFile);
};