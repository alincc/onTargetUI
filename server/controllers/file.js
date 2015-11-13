var path = require('path');
var fs = require("fs");
var request = require('request');
var rootPath = process.env.ROOT;
var mime = require('mime');
var gm = require('gm');
var exec = require('child_process').exec;
var pdfService = require('./../services/pdf');
var imageService = require('./../services/image');
var utilService = require('./../services/util');
var config = require('./../config');

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
  var docId = req.body.docId;
  var baseRequest = req.body.baseRequest;
  var filePath = path.join(rootPath, relativePath);
  var fileFolder = path.join(rootPath, relativePath.substring(0, relativePath.lastIndexOf('/')));
  var fileExt = path.extname(filePath);
  var fileType = mime.lookup(fileExt);
  var fileName = path.basename(filePath, fileExt);
  var outputFolder = path.dirname(filePath);
  var destinationFolder = path.join(outputFolder, 'output');
  var destinationFilePath = path.join(destinationFolder, tmpNumber + '_' + fileName + '.jpg');
  var exportedFile = path.join(outputFolder, 'converted_' + fileName + '.jpg');
  var relativeExportedFilePath = fileFolder + '/converted_' + fileName + '.jpg';

  if(/\.pdf$/.test(relativePath)) {
    console.log('Start convert pdf to image');
    pdfService.parse(relativePath, function() {
      console.log('Update document conversation complete: ' + JSON.stringify({
          "projectFileId": docId,
          "isConversionComplete": true,
          "baseRequest": baseRequest
        }));
      request({
          method: 'POST',
          body: {"projectFileId": docId, isConversionComplete: true, "baseRequest": baseRequest},
          json: true,
          url: config.PROXY_URL + '/upload/updateConversionComplete'
        },
        function(error, response, body) {
          if(!error && response.statusCode == 200) {

          }
        });
    }, function(error) {
      console.log('Failed to parse pdf to image!', error.message);
    });
    res.send({
      success: true
    });
  }
  else {
    //var folder = path.join(fileFolder, utilService.getFolderNameFromFile(path.basename(filePath)));
    var thumbnail = path.join(fileFolder, fileName + '.thumb.jpg');
    //if(!fs.existsSync(folder)) {
    //  fs.mkdirSync(folder);
    //}
    imageService.cropImageSquare(filePath, thumbnail, 200, function(err){
      res.send({
        success: true
      });
    });
  }

  //var deleteExportFiles = function() {
  //  var files = fs.readdirSync(destinationFolder);
  //  for(var i in files) {
  //    var filePath = destinationFolder + '/' + files[i];
  //    if(files[i].indexOf(tmpNumber + '_' + fileName) > -1) {
  //      fs.unlinkSync(filePath);
  //    }
  //  }
  //};
  //
  //var sendResult = function() {
  //  gm(exportedFile).size(function(err, value) {
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

  //if(fs.existsSync(exportedFile)) {
  //  sendResult();
  //} else {
  //  if(fileExt !== '.pdf') {
  //    res.status(400);
  //    res.send('Please select pdf file!');
  //  } else {
  //    if(!fs.existsSync(filePath)) {
  //      res.status(400);
  //      res.send('File not found!');
  //    } else {
  //      if(!fs.existsSync(destinationFolder)) {
  //        fs.mkdirSync(destinationFolder);
  //      }
  //      console.log('Start convert file...');
  //
  //      console.log('Command: ' + 'gm convert -density 200 "' + filePath + '" -quality 90 "' + destinationFilePath + '"');
  //      exec('convert -density 150 "' + filePath + '" -quality 80 "' + destinationFilePath + '"', function(error) {
  //        if(error) {
  //          console.log('Failed to convert pdf to image!', JSON.stringify(error));
  //          res.status(400);
  //          res.send(error.message);
  //        } else {
  //          console.log('Convert file successful!');
  //          // merge all image into 1
  //          var gmstate;
  //          var files = fs.readdirSync(destinationFolder);
  //          for(var i in files) {
  //            var filePath = destinationFolder + '/' + files[i];
  //            if(files[i].indexOf(tmpNumber + '_' + fileName) > -1) {
  //              if(gmstate) {
  //                gmstate.append(filePath);
  //              } else {
  //                gmstate = gm(filePath);
  //              }
  //            }
  //          }
  //          console.log('Start merging files into single file...');
  //          // finally write out the file asynchronously
  //          gmstate.write(exportedFile, function(err) {
  //            if(err) {
  //              console.log('Failed to merge files!', JSON.stringify(err));
  //              res.status(400);
  //              res.send(err.message);
  //            } else {
  //              console.log('Merge files successful!');
  //              deleteExportFiles();
  //
  //              sendResult();
  //            }
  //          });
  //        }
  //      });
  //    }
  //  }
  //}
}

function getPdfImage(req, res) {
  var relativePath = req.body.path;
  //var filePath = [rootPath, relativePath].join('/');
  var filePath = path.join(rootPath, relativePath);
  //var fileName = relativePath.substring(relativePath.lastIndexOf('/') + 1).substring(0, relativePath.substring(relativePath.lastIndexOf('/') + 1).lastIndexOf('.'));
  var fileName = path.basename(filePath, path.extname(filePath));
  //var outputFolder = filePath.substring(0, filePath.lastIndexOf('\\'));
  var outputFolder = path.dirname(filePath);
  //var exportedFile = outputFolder + '/converted_' + fileName + '.jpg';
  var exportedFile = path.join(outputFolder, 'converted_' + fileName + '.jpg');
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