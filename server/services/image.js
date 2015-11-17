var gm = require('gm');
var mime = require('mime');
var fs = require('fs');
var config = require('./../config');
var util = require('./util');
var Promise = require('promise');
var exec = require('child_process').exec;
var path = require('path');
var exports = {};

exports.crop = function(path, name, success, failure) {
  gm(path).size(function(err, value) {
    if(err) {
      failure(err);
    } else {
      var url = config.assetsPath; // assets folder
      if(!fs.existsSync(url)) {
        fs.mkdirSync(url);
      }

      url += '/temp'; // assets/temp folder

      if(!fs.existsSync(url)) {
        fs.mkdirSync(url);
      }

      var croppedImagePath = url + '/' + util.makeId(8) + '.' + path.substring(path.lastIndexOf('.') + 1);
      var imgWidth = value.width;
      var imgHeight = value.height;
      var cropWidth = imgWidth;
      var cropHeight = imgHeight;
      if(cropWidth > cropHeight) {
        cropWidth = cropHeight;
      }
      else if(cropHeight > cropWidth) {
        cropHeight = cropWidth;
      }
      var x = (imgWidth / 2) - (cropWidth / 2);
      var y = (imgHeight / 2) - (cropHeight / 2);

      // Crop
      gm(path)
        .crop(cropWidth, cropHeight, x, y)
        .write(croppedImagePath, function(err) {
          if(err) {
            failure(err);
          } else {
            fs.stat(croppedImagePath, function(err, stat) {
              if(err) {
                failure(err);
              }
              else {
                success({
                  name: name,
                  path: croppedImagePath,
                  size: stat.size,
                  type: mime.lookup(croppedImagePath.substring(croppedImagePath.lastIndexOf('.') + 1))
                });
              }
            });
          }
        });
    }
  });
};

exports.cropImageSquare = function(input, output, size, cb) {
  gm(input).size(function(err, value) {
    if(err) {
      cb(err);
    } else {
      var imgWidth = value.width;
      var imgHeight = value.height;
      var cropWidth = imgWidth;
      var cropHeight = imgHeight;
      if(cropWidth > cropHeight) {
        cropWidth = cropHeight;
      }
      else if(cropHeight > cropWidth) {
        cropHeight = cropWidth;
      }
      var x = (imgWidth / 2) - (cropWidth / 2);
      var y = (imgHeight / 2) - (cropHeight / 2);

      // Crop
      gm(input)
        .crop(cropWidth, cropHeight, x, y)
        .resize(size)
        .write(output, function(err) {
          if(err) {
            cb(err);
          } else {
            cb();
          }
        });
    }
  });
};

exports.tiles = function(input, size, zoom, crop) {
  crop = crop || 512;
  var fileFolder = path.dirname(input);
  var fileName = path.basename(input);
  var destinationFolder = path.join(fileFolder, util.getFolderNameFromFile(fileName) + '_tiles');

  if(!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder);
  }

  destinationFolder = path.join(destinationFolder, zoom.toString());

  if(!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder);
  }

  destinationFolder = path.join(destinationFolder, '%[filename:tile].png');

  return new Promise(function(resolve, reject) {
    //exec('convert "' + input + '" -resize ' + size + 'x' + size + ' -background transparent -extent ' + size + 'x' + size + ' -crop ' + crop + 'x' + crop + ' -set filename:tile "%[fx:page.x/' + crop + ']_%[fx:page.y/' + crop + ']" +repage +adjoin "' + destinationFolder + '"', function(err) {
    //  if(err) {
    //    console.log('Splice level ' + zoom + ' failed!', err.message);
    //    reject(err);
    //  } else {
    //    console.log('Splice level ' + zoom + ' successful!');
    //    resolve();
    //  }
    //});

    exec('gm convert "' + input + '" -resize ' + size + 'x -crop ' + crop + 'x' + crop + ' -set filename:tile "%[fx:page.x/' + crop + ']_%[fx:page.y/' + crop + ']" -background transparent -extent ' + crop + 'x' + crop + ' +repage +adjoin "' + destinationFolder + '"', function(err) {
      if(err) {
        console.log('Splice level ' + zoom + ' failed!', err.message);
        reject(err);
      } else {
        console.log('Splice level ' + zoom + ' successful!');
        resolve();
      }
    });
  });
};

module.exports = exports;