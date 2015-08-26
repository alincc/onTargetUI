var express = require('express');
var path = require('path');
var fs = require("fs");
var mkdirp = require("mkdirp");
var rimraf = require("rimraf");
var rootPath = process.env.ROOT;
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var excelParser = require('excel-parser');

// paths/constants
var fileInputName = "file",
  assetsPath = path.join(rootPath, 'assets'),
  uploadedFilesPath = assetsPath + "/uploads/",
  imagePathRoot = 'assets/uploads/',
  maxFileSize = 10000000; // in bytes

function uploadFile(req, res) {
  var file = req.files[fileInputName],
    uuid = req.body.uuid,
    responseData = {
      success: false
    };

  file.name = req.body.fileName;

  if(isValid(file.size)) {
    moveUploadedFile(file, uuid, function() {
        responseData.success = true;
        responseData.url = imagePathRoot + uuid + "/" + file.name;
        responseData.name = file.name;
        responseData.type = file.type;
        responseData.size = file.size;
        var fileUrl = path.join(rootPath, responseData.url);

        excelParser.parse({
          inFile: fileUrl,
          worksheet: 1,
          skipEmpty: true//,
          //searchFor: {
          //  term: ['my serach term'],
          //  type: 'loose'
          //}
        }, function(err, records) {
          if(err) {
            res.send({
              success: false,
              error: err
            });
          }
          else {
            responseData.records = records;
            res.send(responseData);
          }
        });
      },
      function() {
        responseData.error = "Problem copying the file!";
        res.send(responseData);
      });
  }
  else {
    failWithTooBigFile(responseData, res);
  }
}

function failWithTooBigFile(responseData, res) {
  responseData.error = "Too big!";
  responseData.preventRetry = true;
  res.send(responseData);
}

function isValid(size) {
  return size < maxFileSize;
}

function moveFile(destinationDir, sourceFile, destinationFile, success, failure) {
  mkdirp(destinationDir, function(error) {
    var sourceStream, destStream;

    if(error) {
      console.error("Problem creating directory " + destinationDir + ": " + error);
      failure();
    }
    else {
      sourceStream = fs.createReadStream(sourceFile);
      destStream = fs.createWriteStream(destinationFile);

      sourceStream
        .on("error", function(error) {
          console.error("Problem copying file: " + error.stack);
          failure();
        })
        .on("end", success)
        .pipe(destStream);
    }
  });
}

function moveUploadedFile(file, uuid, success, failure) {
  var destinationDir = uploadedFilesPath + uuid + "/",
    fileDestination = destinationDir + file.name;

  moveFile(destinationDir, file.path, fileDestination, success, failure);
}

module.exports = function(app) {
  app.post('/node/xls-parser', [multipartMiddleware], uploadFile);
};