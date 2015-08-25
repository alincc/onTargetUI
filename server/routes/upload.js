var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require("fs");
var mkdirp = require("mkdirp");
var rimraf = require("rimraf");
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var rootPath = path.resolve(__dirname+'/../../');

// paths/constants
var fileInputName = "file",
  assetsPath = path.join(rootPath, 'src') + "/assets/",
  uploadedFilesPath = assetsPath + "uploads/",
  imagePathRoot = 'assets/uploads/',
  maxFileSize = 10000000; // in bytes

function uploadFile(req, res) {
  var file = req.files[fileInputName],
    uuid = req.body.uuid,
    context = req.body.context,
    responseData = {
      success: false
    };

  file.name = req.body.fileName;

  if(isValid(file.size)) {
    moveUploadedFile(file, uuid, context, function() {
        responseData.success = true;
        responseData.url = imagePathRoot + context + '/' + uuid + "/" + file.name;
        res.send(responseData);
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

function moveUploadedFile(file, uuid, context, success, failure) {
  var destinationDir = uploadedFilesPath + context + '/' + uuid + "/",
    fileDestination = destinationDir + file.name;

  moveFile(destinationDir, file.path, fileDestination, success, failure);
}

router.post('/upload', [multipartMiddleware], uploadFile);

module.exports = router;