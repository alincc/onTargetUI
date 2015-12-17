var path = require('path');
var fs = require("fs");
var request = require('request');
var rootPath = process.env.ROOT;
var mime = require('mime');
var utilService = require('./util');
var exec = require('child_process').exec;
var gm = require('gm');
var imageService = require('./image');
var aws = require('./aws');
var Promise = require('promise');
var _ = require('lodash');
var config = require('./../config');

var exports = {};

function _uploadPagesToS3(files, relativePath, s3FilePath) {
  return new Promise(function(res, rej) {
    var promises = [];
    var filePath = path.join(rootPath, relativePath);
    var fileFolder = path.join(rootPath, string.path(relativePath).baseDir);
    var fileName = path.basename(filePath);
    var folderName = utilService.getFolderNameFromFile(fileName);
    var folder = path.join(fileFolder, folderName);

    function _upload(filePath, key) {
      return new Promise(function(resolve, reject) {
        aws.s3.upload(fs.createReadStream(filePath), key)
          .then(function(data) {
            resolve();
          }, function(err) {
            console.log('Failed to upload to S3!', key);
            resolve();
          });
      });
    }

    _.each(files, function(fn) {
      var fp = path.join(folder, 'pages', fn);
      var key = string.join('/', string.path(s3FilePath).baseDir, folderName, 'pages', fn);
      if(fs.lstatSync(fp).isFile()) {
        promises.push(_upload(fp, key));
      }
    });

    Promise.all(promises)
      .then(function() {
        res();
      });
  });
}

function parse(relativePath, s3FilePath) {
  return new Promise(function(resolve, reject) {
    var filePath = path.join(rootPath, relativePath);
    var fileFolder = path.join(rootPath, string.path(relativePath).baseDir);
    var fileExt = path.extname(filePath);
    var fileType = mime.lookup(fileExt);
    var fileName = path.basename(filePath);
    var fileNameWithoutExt = path.basename(filePath, fileExt);
    var folderName = utilService.getFolderNameFromFile(fileName);
    var folder = path.join(fileFolder, folderName);
    var thumbnailName = fileNameWithoutExt + '.thumb.jpg';
    var thumbnailPath = string.join('/', string.path(s3FilePath).baseDir, folderName, thumbnailName);
    //var destinationFilePath = path.join(folder, 'pages', fileNameWithoutExt + '.jpg'); // gm convert
    var destinationFilePath = path.join(folder, 'pages', fileNameWithoutExt + '-%01d' + '.jpg'); // gs convert

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
    console.log('Executing command: ' + config.gsCommand + ' -dNumRenderingThreads=2 -dNOPAUSE -sDEVICE=jpeg -sOutputFile="' + destinationFilePath + '" -dJPEGQ=100 -r350 -q "' + path.join(rootPath, relativePath) + '" -c quit');
    exec(config.gsCommand + ' -dNumRenderingThreads=2 -dNOPAUSE -sDEVICE=jpeg -sOutputFile="' + destinationFilePath + '" -dJPEGQ=100 -r350 -q "' + path.join(rootPath, relativePath) + '" -c quit', function(error) { //gs convert
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
          var thumbnail = path.join(folder, thumbnailName);
          console.log('Making thumbnail...');
          console.time('MakingThumbnail');
          imageService.cropImageSquare(filePath, thumbnail, 200, function(err) {
            if(err) {
              console.log('Making thumbnail...Failed!', err.message);
              reject(err);
            } else {
              console.log('Making thumbnail...Done!');
              console.log('Uploading thumbnail to S3');
              // upload thumbnail to s3
              aws.s3.upload(fs.createReadStream(thumbnail), thumbnailPath)
                .then(function(data) {
                  console.log('Uploading thumbnail to S3...Done!');
                  console.log('Uploading Pages to S3');
                  _uploadPagesToS3(files, relativePath, s3FilePath)
                    .then(function() {
                      console.log('Uploading Pages to S3...Done!');
                      resolve();
                    });
                }, function(err) {
                  console.log('Failed to upload thumbnail to S3!', thumbnailPath);
                  console.log('Uploading Pages to S3');
                  _uploadPagesToS3(files, relativePath, s3FilePath)
                    .then(function() {
                      console.log('Uploading Pages to S3...Done!');
                      resolve();
                    });
                });
            }
            console.timeEnd('MakingThumbnail');
          });
        }
        else {
          console.log('Uploading Pages to S3');
          _uploadPagesToS3(files, relativePath, s3FilePath)
            .then(function() {
              console.log('Uploading Pages to S3...Done!');
              resolve();
            });
        }
      }
    });
  });
}

exports.parse = parse;

module.exports = exports;