var gm = require('gm');
var mime = require('mime');
var mkdirp = require("mkdirp");
var fs = require('fs');
var config = require('./../config');
var util = require('./util');
var exports = {};

exports.crop = function(path, name, success, failure){
  gm(path).size(function(err, value){
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
        .write(croppedImagePath, function(err){
          if(err) {
            failure(err);
          } else {
            fs.stat(croppedImagePath, function(err, stat){
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

module.exports = exports;