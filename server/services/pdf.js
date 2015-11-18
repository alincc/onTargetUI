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

    var destinationFilePath = path.join(folder, 'pages', fileNameWithoutExt + '.jpg'); // gm convert
    //var destinationFilePath = path.join(folder, 'pages', fileNameWithoutExt + '-%01d' + '.jpg'); // gs convert

    if(!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    } else {
      resolve();
      return;
    }

    if(!fs.existsSync(path.join(folder, 'pages'))) {
      fs.mkdirSync(path.join(folder, 'pages'));
    }
    console.time('ConvertPdfToImages');
    // convert pdf pages to images
    //console.log('Executing command: ' + config.convertCommand + ' -density 300 "' + filePath + '" -quality 100 "' + destinationFilePath + '"');
    //exec(config.convertCommand + ' -density 300 "' + filePath + '" -quality 100 "' + destinationFilePath + '"', function(error) { // gm convert
    console.log('Executing command: ' + config.gsCommand + ' -dNumRenderingThreads=2 -dNOPAUSE -sDEVICE=jpeg -sOutputFile="' + destinationFilePath + '" -dJPEGQ=100 -r350 -q "' + filePath + '" -c quit');
    exec(config.gsCommand + ' -dNumRenderingThreads=2 -dNOPAUSE -sDEVICE=jpeg -sOutputFile="' + destinationFilePath + '" -dJPEGQ=100 -r350 -q "' + filePath + '" -c quit', function(error) { //gs convert
      console.timeEnd('ConvertPdfToImages');
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
          console.log('Making thumbnail...');
          console.time('MakingThumbnail');
          imageService.cropImageSquare(filePath, thumbnail, 200, function(err) {
            if(err) {
              console.log('Making thumbnail...Failed!', err.message);
              reject(err);
            } else {
              console.log('Making thumbnail...Done!');
              resolve();
            }
            console.timeEnd('MakingThumbnail');
          });
        } else {
          resolve();
        }
      }
    });
  });
}

exports.parse = parse;

module.exports = exports;