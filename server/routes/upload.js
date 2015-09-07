var express = require('express');
var path = require('path');
var fs = require("fs");
var mkdirp = require("mkdirp");
var rimraf = require("rimraf");
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var gm = require('gm');
var config = require('./../config');
var imageService = require('./../services/image');
var crypto = require('crypto'),
  algorithm = 'aes-256-ctr',
  password = 'd6F3Efeq';

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

// paths/constants
var fileInputName = config.fileInputName,
  uploadedFilesPath = config.uploadedFilesPath,
  imagePathRoot = config.imagePathRoot,
  maxFileSize = config.maxFileSize, // in bytes
  fileName = '',
  encryptedProjectFolderName = '';

function uploadFile(req, res) {
  var file = req.files[fileInputName],
    uuid = req.body.uuid,
    rootFolder = req.body.folder,
    projectId = req.body.projectId,
    context = req.body.context,
    crop = req.body.crop || false,
    responseData = {
      success: false
    };
  fileName = req.body.fileName;

  file.name = fileName;

  if(isValid(file.size)) {
    function upload(file) {
      encryptedProjectFolderName = encrypt('projects-' + projectId);
      moveUploadedFile(file, uuid, rootFolder, projectId, context, function() {
          var url = imagePathRoot + rootFolder + '/';
          if(rootFolder === 'projects') {
            if(context === '') {
              url += encryptedProjectFolderName + '/' + fileName;
            }
            else {
              url += encryptedProjectFolderName + '/' + context + '/' + fileName;
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
          responseData.error = "Problem copying the file!";
          res.send(responseData);
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

function moveUploadedFile(file, uuid, rootFolder, projectId, context, success, failure) {
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
        url += '/' + encryptedProjectFolderName;
        if(context === '') {
          destinationDir = url;
          fileDestination = destinationDir + '/' + fileName;
          // Check if file exist, then change file name
          if(path.existsSync(fileDestination)) {
            fileName = new Date().getTime() + '-' + fileName;
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
              if(path.existsSync(fileDestination)) {
                fileName = new Date().getTime() + '-' + fileName;
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
    if(path.existsSync(fileDestination)) {
      fileName = new Date().getTime() + '-' + fileName;
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

module.exports = function(app) {
  app.post('/node/upload', [multipartMiddleware], uploadFile);
};