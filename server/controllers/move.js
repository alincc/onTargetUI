var path = require('path');
var fs = require("fs");
var request = require('request');
var mkdirp = require("mkdirp");
var rootPath = process.env.ROOT;
var mime = require('mime');
var config = require('./../config');
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
    var lastDuplicateNumber = _.sortBy(duplicates).reverse();
    var duplicateNumber = /.*\s+\((\d+)\)\./.exec(lastDuplicateNumber)[1];
    if(duplicateNumber) {
      newName = fileNameWithoutExt + ' (' + (parseInt(duplicateNumber) + 1) + ').' + fileExt;
    }
  }
  return newName;
}

// paths/constants
var uploadedFilesPath = config.uploadedFilesPath,
  imagePathRoot = config.imagePathRoot;

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

  var url = uploadedFilesPath + rootFolder,
    destinationDir,
    fileDestination;

  function success() {
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
      res.status(400);
      res.send('Folder not found!');
    }

    responseData.success = true;
    responseData.url = url;
    responseData.name = fileName;
    responseData.type = mime.lookup(fileName.substring(fileName.lastIndexOf('.') + 1));
    res.send(responseData);
  }

  function error(err) {
    res.status(400);
    res.send(JSON.stringify(err));
  }

  function failure() {
    res.status(400);
    res.send('Problem moving the file!');
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

  if(fs.existsSync(sourceFilePath)) {
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
            moveFile(destinationDir, sourceFilePath, fileDestination, success, failure);
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

                moveFile(destinationDir, sourceFilePath, fileDestination, success, failure);
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
      moveFile(destinationDir, sourceFilePath, fileDestination, success, failure);
    }
    else {
      res.status(400);
      res.send('Folder not found!');
    }
  }
  else {
    res.status(400);
    res.send("File not exist!. " + path.join(rootPath, filePath));
  }
}

module.exports = {
  move: moveFile
};