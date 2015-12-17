var path = require('path');
var fs = require("fs");
var request = require('request');
var rootPath = process.env.ROOT;
var mime = require('mime');
var config = require('./../config');
var aws = require('./../services/aws');
var utilService = require('./../services/util');
var _ = require('lodash');

function moveFile(req, res) {
  var responseData = {
    success: false
  };
  var filePath = req.body.path;
  var rootFolder = req.body.folder;
  var projectAssetFolderName = req.body.projectAssetFolderName;
  var context = req.body.context;
  var fileName = req.body.fileName;
  var sourceFilePath = path.join(rootPath, filePath);

  function success(absoluteUrl) {
    responseData.success = true;
    responseData.url = utilService.generateAssetPath(rootFolder, projectAssetFolderName, context, fileName);
    responseData.name = fileName;
    responseData.type = string.path(fileName).mimeType;
    res.send(responseData);
  }

  function failure(msg) {
    res.status(400);
    res.send(msg);
  }

  function moveFile(sourceFile, success, failure) {
    var sourceStream = fs.createReadStream(sourceFile);
    var url = utilService.generateAssetPath(rootFolder, projectAssetFolderName, context, fileName);
    url = aws.s3.ensureFileNotExists(url)
      .then(function(k) {
        url = k;
        fileName = string.path(url).name;
        aws.s3.upload(sourceStream, url, function(evt) {
          // console.log(evt);
        }).
          then(function(data) {
            console.log(data);
            success(data.Location);
          }, function(err) {
            console.log(err);
            failure(err.message)
          });
      });
  }

  if(fs.existsSync(sourceFilePath)) {
    moveFile(sourceFilePath, success, failure);
  }
  else {
    failure("File not exist!. " + path.join(rootPath, filePath));
  }
}

module.exports = {
  move: moveFile
};