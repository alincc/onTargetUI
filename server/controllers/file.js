var path = require('path');
var fs = require("fs");
var request = require('request');
var rootPath = process.env.ROOT;
var mime = require('mime');
var gm = require('gm');
var exec = require('child_process').exec;

function getFileInfo(req, res) {
  var relativePath = req.body.path;
  var filePath = path.join(rootPath, relativePath);
  var fileExt = relativePath.substring(relativePath.lastIndexOf('.') + 1);
  var fileType = mime.lookup(fileExt);

  if(!fs.existsSync(filePath)) {
    res.status(400);
    res.send('File not found!');
  } else {
    if(/(png|jpg|jpeg|bmp)/i.test(fileExt)) {
      gm(filePath).size(function(err, value) {
        if(err) {
          res.status(400);
          res.send(err);
        } else {
          var imgWidth = value.width;
          var imgHeight = value.height;

          var stats = fs.statSync(filePath);
          var fileSizeInBytes = stats["size"];

          res.send({
            success: true,
            type: fileType,
            width: imgWidth,
            height: imgHeight,
            url: relativePath,
            size: fileSizeInBytes
          });
        }
      });
    } else {
      res.status(400);
      res.send('File type not found for ' + fileExt);
    }
  }
}

function convertPdfToImage(req, res) {
  var tmpNumber = new Date().getTime();
  var relativePath = req.body.path;
  var filePath = [rootPath, relativePath].join('/');
  var fileExt = relativePath.substring(relativePath.lastIndexOf('.') + 1).toLowerCase();
  var fileType = mime.lookup(fileExt);
  var fileName = relativePath.substring(relativePath.lastIndexOf('/') + 1).substring(0, relativePath.substring(relativePath.lastIndexOf('/') + 1).lastIndexOf('.'));
  var outputFolder = filePath.substring(0, filePath.lastIndexOf('/'));
  var destinationFolder = outputFolder + '/output';
  var destinationFilePath = destinationFolder + '/' + tmpNumber + '_' + fileName + '.jpg';
  var exportedFile = outputFolder + '/converted_' + fileName + '.jpg';
  var relativeExportedFilePath = relativePath.substring(0, relativePath.lastIndexOf('/')) + '/converted_' + fileName + '.jpg';

  var deleteExportFiles = function() {
    var files = fs.readdirSync(destinationFolder);
    for(var i in files) {
      var filePath = destinationFolder + '/' + files[i];
      if(files[i].indexOf(tmpNumber + '_' + fileName) > -1) {
        fs.unlinkSync(filePath);
      }
    }
  };

  var sendResult = function(exportedFile) {
    gm(exportedFile).size(function(err, value) {
      if(err) {
        res.status(400);
        res.send(err);
      } else {
        var stats = fs.statSync(exportedFile);
        var fileSizeInBytes = stats["size"];

        res.send({
          success: true,
          type: mime.lookup('jpg'),
          width: value.width,
          height: value.height,
          url: relativeExportedFilePath,
          size: fileSizeInBytes
        });
      }
    });
  };

  if(fs.existsSync(exportedFile)) {
    sendResult(exportedFile);
  } else {
    if(fileExt !== 'pdf') {
      if(/(jpg|jpeg|png)/.test(fileExt)) {
        console.log(filePath);
        sendResult(filePath);
      } else {
        res.status(400);
        res.send('Please select pdf or image file!');
      }
    } else {
      if(!fs.existsSync(filePath)) {
        res.status(400);
        res.send('File not found!');
      } else {
        if(!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder);
        }
        exec('/usr/local/bin/gm convert -density 200 "' + filePath + '" -quality 100 "' + destinationFilePath+'"', function(error) {
          if(error) {
            res.status(400);
            res.send(error);
          } else {
            // merge all image into 1
            var gmstate;
            var files = fs.readdirSync(destinationFolder);
            for(var i in files) {
              var filePath = destinationFolder + '/' + files[i];
              if(files[i].indexOf(tmpNumber + '_' + fileName) > -1) {
                if(gmstate) {
                  gmstate.append(filePath);
                } else {
                  gmstate = gm(filePath);
                }
              }
            }
            // finally write out the file asynchronously
            gmstate.write(exportedFile, function(err) {
              if(err) {
                res.status(400);
                res.send(err);
              } else {

                deleteExportFiles();

                sendResult(exportedFile);
              }
            });
          }
        });
      }
    }
  }
}

function getPdfImage(req, res) {
  var relativePath = req.body.path;
  var filePath = [rootPath, relativePath].join('/');
  var fileName = relativePath.substring(relativePath.lastIndexOf('/') + 1).substring(0, relativePath.substring(relativePath.lastIndexOf('/') + 1).lastIndexOf('.'));
  var outputFolder = filePath.substring(0, filePath.lastIndexOf('/'));
  var exportedFile = outputFolder + '/converted_' + fileName + '.jpg';
  var relativeExportedFilePath = relativePath.substring(0, relativePath.lastIndexOf('/')) + '/converted_' + fileName + '.jpg';

  var sendResult = function() {
    gm(exportedFile).size(function(err, value) {
      if(err) {
        res.status(400);
        res.send(err);
      } else {
        var stats = fs.statSync(exportedFile);
        var fileSizeInBytes = stats["size"];

        res.send({
          success: true,
          type: mime.lookup('jpg'),
          width: value.width,
          height: value.height,
          url: relativeExportedFilePath,
          size: fileSizeInBytes
        });
      }
    });
  };

  if(fs.existsSync(exportedFile)) {
    sendResult();
  } else {
    res.status(400);
    res.send('Image not found');
  }
}

module.exports = {
  fileInfo: getFileInfo,
  pdfImage: getPdfImage,
  convertPdfToImage: convertPdfToImage
};