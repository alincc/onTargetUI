var path = require('path');
var fs = require("fs");
var request = require('request');
var mkdirp = require("mkdirp");
var rootPath = process.env.ROOT;
var mime = require('mime');
var crypto = require('crypto'),
  algorithm = 'aes-256-ctr',
  password = 'd6F3Efeq';

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, password)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

// paths/constants
var assetsPath = path.join(rootPath, 'assets'),
  uploadedFilesPath = assetsPath + "/",
  imagePathRoot = 'assets/';

function moveFile(req, res) {
  var responseData = {
    success: false
  };
  var filePath = req.body.path;
  var rootFolder = req.body.folder;
  var projectId = req.body.projectId;
  var context = req.body.context;
  var fileName = req.body.fileName;
  var sourceFilePath = path.join(rootPath, filePath);
  var encryptedProjectFolderName = '';

  var url = uploadedFilesPath + rootFolder,
    destinationDir,
    fileDestination;

  function success() {
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

  if(path.existsSync(sourceFilePath)) {
    if(rootFolder === 'projects') {
      mkdirp(url, function(error) {
        if(error) {
          console.error("Problem creating directory " + url + ": " + error);
          failure();
        }
        else {
          encryptedProjectFolderName = encrypt('projects-' + projectId);
          url += '/' + encryptedProjectFolderName;
          if(context === '') {
            destinationDir = url;
            fileDestination = destinationDir + '/' + fileName;
            // Check if file exist, then change file name
            if(path.existsSync(fileDestination)) {
              fileName = new Date().getTime() + '-' + fileName;
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
                if(path.existsSync(fileDestination)) {
                  fileName = new Date().getTime() + '-' + fileName;
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
      if(path.existsSync(fileDestination)) {
        fileName = new Date().getTime() + '-' + fileName;
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

module.exports = function(app) {
  app.post('/node/move', moveFile);
};