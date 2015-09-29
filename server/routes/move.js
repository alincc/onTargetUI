var path = require('path');
var fs = require("fs");
var request = require('request');
var mkdirp = require("mkdirp");
var rootPath = process.env.ROOT;
var mime = require('mime');
var gm = require('gm');
var exec = require('child_process').exec;
var config = require('./../config');

// paths/constants
var uploadedFilesPath = config.uploadedFilesPath,
  imagePathRoot = config.imagePathRoot;

function moveFile(req, res){
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

  function success(){
    var url = imagePathRoot + rootFolder + '/',
      fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
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
    responseData.type = mime.lookup(fileExt);

    if(fileExt === 'pdf') {
      convertPdfToImage(url, function(){
        res.send(responseData);
      }, res);
    }
    else {
      res.send(responseData);
    }
  }

  function error(err){
    res.status(400);
    res.send(JSON.stringify(err));
  }

  function failure(){
    res.status(400);
    res.send('Problem moving the file!');
  }

  function moveFile(destinationDir, sourceFile, destinationFile, success, failure){
    mkdirp(destinationDir, function(error){
      var sourceStream, destStream;

      if(error) {
        console.error("Problem creating directory " + destinationDir + ": " + error);
        failure();
      }
      else {
        sourceStream = fs.createReadStream(sourceFile);
        destStream = fs.createWriteStream(destinationFile);

        sourceStream
          .on("error", function(error){
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
      mkdirp(url, function(error){
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
              fileName = new Date().getTime() + '-' + fileName;
              fileDestination = destinationDir + '/' + fileName;
            }
            moveFile(destinationDir, sourceFilePath, fileDestination, success, failure);
          }
          else {
            mkdirp(url, function(error){
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
      if(fs.existsSync(fileDestination)) {
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

function convertPdfToImage(relativePath, cb){
  var tmpNumber = new Date().getTime();
  var filePath = path.join(rootPath, relativePath);
  var fileExt = relativePath.substring(relativePath.lastIndexOf('.') + 1).toLowerCase();
  var fileType = mime.lookup(fileExt);
  var fileName = relativePath.substring(relativePath.lastIndexOf('/') + 1).split('.')[0];
  var outputFolder = filePath.substring(0, filePath.lastIndexOf('\\'));
  var destinationFolder = outputFolder + '\\output';
  var destinationFilePath = destinationFolder + '\\' + tmpNumber + '_' + fileName + '.jpg';
  var exportedFile = outputFolder + '\\converted_' + fileName + '.jpg';
  var relativeExportedFilePath = relativePath.substring(0, relativePath.lastIndexOf('/')) + '/converted_' + fileName + '.jpg';

  var deleteExportFiles = function(){
    var files = fs.readdirSync(destinationFolder);
    for(var i in files) {
      var filePath = destinationFolder + '\\' + files[i];
      if(files[i].indexOf(tmpNumber + '_' + fileName) > -1) {
        fs.unlinkSync(filePath);
      }
    }
  };

  //var sendResult = function(){
  //  gm(exportedFile).size(function(err, value){
  //    if(err) {
  //      res.status(400);
  //      res.send(err);
  //    } else {
  //      var stats = fs.statSync(exportedFile);
  //      var fileSizeInBytes = stats["size"];
  //
  //      res.send({
  //        success: true,
  //        type: mime.lookup('jpg'),
  //        width: value.width,
  //        height: value.height,
  //        url: relativeExportedFilePath,
  //        size: fileSizeInBytes
  //      });
  //    }
  //  });
  //};

  if(fs.existsSync(exportedFile)) {
    cb();
  } else {
    if(fileExt !== 'pdf') {
      //res.status(400);
      //res.send('Please select pdf file!');
      console.log('Please select pdf file!');
      cb();
    } else {
      if(!fs.existsSync(filePath)) {
        //res.status(400);
        //res.send('File not found!');
        console.log('File not found!');
        cb();
      } else {
        if(!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder);
        }
        exec('convert -density 300 "' + filePath + '" -quality 100 "' + destinationFilePath + '"', function(error){
          if(error) {
            //res.status(400);
            //res.send(error);
            console.log(JSON.stringify(error));
            cb();
          } else {
            // merge all image into 1
            var gmstate;
            var files = fs.readdirSync(destinationFolder);
            for(var i in files) {
              var filePath = destinationFolder + '\\' + files[i];
              if(files[i].indexOf(tmpNumber + '_' + fileName) > -1) {
                if(gmstate) {
                  gmstate.append(filePath);
                } else {
                  gmstate = gm(filePath);
                }
              }
            }
            // finally write out the file asynchronously
            gmstate.write(exportedFile, function(err){
              if(err) {
                //res.status(400);
                //res.send(err);
                console.log(JSON.stringify(err));
                cb();
              } else {
                deleteExportFiles();

                //sendResult();
                cb();
              }
            });
          }
        });
      }
    }
  }
}

module.exports = function(app){
  app.post('/node/move', moveFile);
};