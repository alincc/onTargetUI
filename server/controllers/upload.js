var express = require('express');
var path = require('path');
var fs = require("fs");
var mkdirp = require("mkdirp");
var gm = require('gm');
var rootPath = process.env.ROOT;
var config = require('./../config');
var imageService = require('./../services/image');
var _ = require('lodash');

function generateNewFileName(filePath) {
  var fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
  var fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  var fileExt = fileName.substring(fileName.lastIndexOf('.') + 1);
  var fullFilePath = filePath;
  var files = fs.readdirSync(fullFilePath.substring(0, fullFilePath.lastIndexOf('/')));
  var newName = fileName;
  var reg = new RegExp(fileNameWithoutExt + ' \\(\\d+\\).' + fileExt + '$');
  var duplicates = _.filter(files, function(file) {
    return reg.test(file);
  });
  if(duplicates.length <= 0) {
    newName = fileNameWithoutExt + ' (1).' + fileExt;
  } else {
    var lastDuplicateNumber = _.sortBy(duplicates).reverse()[0];
    var duplicateNumber = /.*\s+\((\d+)\)\./.exec(lastDuplicateNumber)[1];
    if(duplicateNumber) {
      newName = fileNameWithoutExt + ' (' + (parseInt(duplicateNumber) + 1) + ').' + fileExt;
    }
  }
  return newName;
}

function uploadFile(req, res) {
  var fileInputName = config.fileInputName,
    uploadedFilesPath = config.uploadedFilesPath,
    imagePathRoot = config.imagePathRoot,
    maxFileSize = config.maxFileSize, // in bytes
    fileName = '',
    encryptedProjectFolderName = '';

  var file = req.files[fileInputName],
    uuid = req.body.uuid,
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

  if(isValid(file.size, maxFileSize)) {
    function upload(file) {
      moveUploadedFile(file, fileName, uploadedFilesPath, uuid, rootFolder, projectAssetFolderName, context, function() {
          var url = imagePathRoot + rootFolder + '/';
          if(rootFolder === 'projects') {
            if(context === '') {
              url += projectAssetFolderName + '/' + fileName;
            }
            else {
              url += projectAssetFolderName + '/' + context + '/' + fileName;
            }
          }
          else if(rootFolder === 'profile') {
            url += fileName; // profile
          }
          else {
            url += uuid + '/' + fileName; // temp
          }
          responseData.success = true;
          responseData.url = url;
          responseData.name = fileName;
          responseData.type = file.type;
          responseData.size = file.size;
          res.send(responseData);
        },
        function() {
          res.status(400);
          res.send('Problem copying the file!');
        });
    }

    if(crop) {
      imageService.crop(file.path, fileName, upload, function(err) {
        res.status(400);
        res.send(err);
      });
    } else {
      upload(file);
    }
  }
  else {
    failWithTooBigFile(responseData, maxFileSize, res);
  }
}

function failWithTooBigFile(responseData, maxFileSize, res) {
  res.status(400);
  res.send('File too big, please update file < ' + (maxFileSize / 1000000).toFixed(2) + 'MB');
}

function isValid(size, maxFileSize) {
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

function moveUploadedFile(file, fileName, uploadedFilesPath, uuid, rootFolder, projectAssetFolderName, context, success, failure) {
  var url = uploadedFilesPath + rootFolder,
    destinationDir,
    fileDestination;

  if(rootFolder === 'projects') {
    mkdirp(url, function(error) {
      if(error) {
        console.error("Problem creating directory " + url + ": " + error);
        failure();
      }
      else {
        url += '/' + projectAssetFolderName;
        if(context === '') {
          destinationDir = url;
          fileDestination = destinationDir + '/' + fileName;
          // Check if file exist, then change file name
          if(fs.existsSync(fileDestination)) {
            fileName = generateNewFileName(fileDestination);
            fileDestination = destinationDir + '/' + fileName;
          }
          moveFile(destinationDir, file.path, fileDestination, success, failure);
        }
        else {
          mkdirp(url, function(error) {
            if(error) {
              console.error("Problem creating directory " + url + ": " + error);
              failure();
            }
            else {
              url += '/' + context;
              destinationDir = url;
              fileDestination = destinationDir + '/' + fileName;

              // Check if file exist, then change file name
              if(fs.existsSync(fileDestination)) {
                fileName = generateNewFileName(fileDestination);
                fileDestination = destinationDir + '/' + fileName;
              }

              moveFile(destinationDir, file.path, fileDestination, success, failure);
            }
          });
        }
      }
    });
  }
  else if(rootFolder === 'profile') {
    destinationDir = url;
    fileDestination = destinationDir + '/' + fileName;
    if(fs.existsSync(fileDestination)) {
      fileName = generateNewFileName(fileDestination);
      fileDestination = destinationDir + '/' + fileName;
    }
    moveFile(destinationDir, file.path, fileDestination, success, failure);
  }
  else {
    mkdirp(url, function(error) {
      if(error) {
        console.error("Problem creating directory " + url + ": " + error);
        failure();
      }
      else {
        destinationDir = url + '/' + uuid + '/';
        fileDestination = destinationDir + fileName;
        moveFile(destinationDir, file.path, fileDestination, success, failure);
      }
    });
  }
}

module.exports = {
  upload: uploadFile
};