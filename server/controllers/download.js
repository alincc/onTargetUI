var path = require('path');
var fs = require("fs");
var request = require('request');
var mime = require('mime');
var config = require('./../config');
var utilService = require('./../services/util');

function downloadFile(req, res) {
  var responseData = {
    success: false
  };
  var url = req.body.url;
  var uuid = req.body.uuid || utilService.newGuidId();
  var fileName = req.body.fileName
    .replace(/\'/g, '_')
    .replace(/\"/g, '_');
  var destinationDir = path.join(config.assetsPath, 'temp');
  utilService.ensureFolderExist(destinationDir);
  destinationDir = path.join(destinationDir, uuid);
  utilService.ensureFolderExist(destinationDir);
  var fileDestination = path.join(destinationDir, fileName);

  function success() {
    responseData.success = true;
    responseData.url = string.join('/', config.imagePathRoot, "temp", uuid, fileName);
    responseData.name = fileName;
    responseData.type =  string.path(fileName).mimeType;
    res.send(responseData);
  }

  function error(err) {
    responseData.error = err;
    res.send(responseData);
  }

  var writeStream = fs.createWriteStream(fileDestination);

  writeStream.on('finish', success);

  writeStream.on('error', error);

  var readStream = request.get(url);

  readStream.on('error', error);

  readStream.pipe(writeStream);
}

module.exports = {
  download: downloadFile
};