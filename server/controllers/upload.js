var express = require('express');
var path = require('path');
var fs = require("fs");
var mime = require('mime');
var gm = require('gm');
var rootPath = process.env.ROOT;
var config = require('./../config');
var imageService = require('./../services/image');
var aws = require('./../services/aws');
var utilService = require('./../services/util');
var _ = require('lodash');

function uploadFile(req, res) {
  var fileInputName = config.fileInputName,
    fileName = '',
    file = req.files[fileInputName],
    uuid = req.body.uuid || utilService.newGuidId(),
    rootFolder = req.body.folder,
    projectAssetFolderName = req.body.projectAssetFolderName,
    context = req.body.context,
    crop = req.body.crop === "true" ? true : false,
    responseData = {
      success: false
    };
  fileName = req.body.fileName
    .replace(/\'/g, '_')
    .replace(/\"/g, '_');

  file.name = fileName;
  console.log("Uploading the file  " + fileName + " with size: " + file.size);
  console.log("Max File size allowed:" + config.maxFileSize);
  console.log("is valid file ?? " + isValid(file.size));
  if(isValid(file.size)) {

    function success(absoluteUrl) {
      responseData.success = true;
      responseData.url = utilService.generateAssetPath(rootFolder, projectAssetFolderName, context, fileName, uuid);
      responseData.name = fileName;
      responseData.type = string.path(fileName).mimeType;
      responseData.size = file.size;
      res.send(responseData);
    }

    function failure(msg) {
      res.status(400);
      res.send(msg);
    }

    function upload(file) {
      var sourceStream = fs.createReadStream(file.path);
      var url = utilService.generateAssetPath(rootFolder, projectAssetFolderName, context, fileName, uuid);
      if(rootFolder === 'temp') {
        var destStream = fs.createWriteStream(path.join(rootPath, url));
        sourceStream
          .on("error", function(error) {
            console.error("Problem copying file: " + error.stack);
            failure();
          })
          .on("end", success)
          .pipe(destStream);
      } else {
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
    }

    if(crop) {
      imageService.crop(file.path, fileName, upload, function(err) {
        failure(err.message);
      });
    } else {
      upload(file);
    }
  }
  else {
    failure('File too big, please update file < ' + (config.maxFileSize / 1000000).toFixed(2) + 'MB');
  }
}

function isValid(size) {
  return size < config.maxFileSize;
}

module.exports = {
  upload: uploadFile
};