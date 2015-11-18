var path = require('path');
var fs = require("fs");
var request = require('request');
var rootPath = process.env.ROOT;
var mime = require('mime');
var utilService = require('./util');
var exec = require('child_process').exec;
var gm = require('gm');
var imageService = require('./image');
var Promise = require('promise');
var _ = require('lodash');
var config = require('./../config');

var exports = {};

function parse(relativePath) {
  return new Promise(function(resolve, reject) {
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
      resolve();
      return;
    }

    if(!fs.existsSync(path.join(folder, 'pages'))) {
      fs.mkdirSync(path.join(folder, 'pages'));
    }

    // convert pdf pages to images
    exec(config.convertCommand + ' -density 300 "' + filePath + '" -quality 100 "' + destinationFilePath + '"', function(error) {
      if(error) {
        reject(error);
      } else {

        // Make thumbnail
        var files = fs.readdirSync(path.join(folder, 'pages')), firstPage;
        if(files.length > 0) {
          firstPage = files[0];
        }

        if(firstPage) {
          var filePath = path.join(folder, 'pages', firstPage);
          var thumbnail = path.join(folder, fileNameWithoutExt + '.thumb.jpg');
          imageService.cropImageSquare(filePath, thumbnail, 200, function(err) {
            if(err) {
              reject(error);
            } else {
              resolve();
            }
          });
        }else{
          resolve();
        }
      }
    });
  });
}

exports.parse = parse;

module.exports = exports;