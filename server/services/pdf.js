var path = require('path');
var fs = require("fs");
var request = require('request');
var rootPath = process.env.ROOT;
var mime = require('mime');
var utilService = require('./util');
var exec = require('child_process').exec;
var gm = require('gm');
var imageService = require('./image');
var _ = require('lodash');

var exports = {};

function parse(relativePath, success, fail) {
  var filePath = path.join(rootPath, relativePath);
  var fileFolder = path.join(rootPath, relativePath.substring(0, relativePath.lastIndexOf('/')));
  var fileExt = path.extname(filePath);
  var fileType = mime.lookup(fileExt);
  var fileName = path.basename(filePath);
  var fileNameWithoutExt = path.basename(filePath, fileExt);
  var folder = path.join(fileFolder, utilService.getFolderNameFromFile(fileName));
  var destinationFilePath = path.join(folder, 'pages', fileNameWithoutExt + '.jpg');
  if(!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  } else {
    if(success) {
      success();
    }
    return;
  }

  if(!fs.existsSync(path.join(folder, 'pages'))) {
    fs.mkdirSync(path.join(folder, 'pages'));
  }

  // convert pdf pages to images
  exec('gm convert -density 300 "' + filePath + '" -quality 100 "' + destinationFilePath + '"', function(error) {
    if(error) {
      if(fail) {
        fail(error);
      }
    } else {
      var files = fs.readdirSync(path.join(folder, 'pages')), firstPage;
      if(files.length > 0) {
        firstPage = files[0];
      }

      if(firstPage) {
        var filePath = path.join(folder, 'pages', firstPage);
        var thumbnail = path.join(folder, fileNameWithoutExt + '.thumb.jpg');

        imageService.cropImageSquare(filePath, thumbnail, 200, function(err) {
          if(err) {
            if(fail) {
              fail(err);
            }
          } else {
            if(success) {
              success();
            }
          }
        });

        //gm(filePath).size(function(err, value) {
        //  if(err) {
        //    if(fail) {
        //      fail(err);
        //    }
        //  } else {
        //    var imgWidth = value.width;
        //    var imgHeight = value.height;
        //    var cropWidth = imgWidth;
        //    var cropHeight = imgHeight;
        //    if(cropWidth > cropHeight) {
        //      cropWidth = cropHeight;
        //    }
        //    else if(cropHeight > cropWidth) {
        //      cropHeight = cropWidth;
        //    }
        //    var x = (imgWidth / 2) - (cropWidth / 2);
        //    var y = (imgHeight / 2) - (cropHeight / 2);
        //    // Crop
        //    gm(filePath)
        //      .crop(cropWidth, cropHeight, x, y)
        //      .resize(200)
        //      .write(thumbnail, function(err) {
        //        if(err) {
        //          if(fail) {
        //            fail(err);
        //          }
        //        } else {
        //          if(success) {
        //            success();
        //          }
        //        }
        //      });
        //  }
        //});
      }

      if(success) {
        success();
      }
    }
  });
}

exports.parse = parse;

module.exports = exports;