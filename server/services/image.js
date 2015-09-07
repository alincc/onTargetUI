var gm = require('gm');
var mime = require('mime');
var mkdirp = require("mkdirp");
var fs = require('fs');
var config = require('./../config');
var exports = {};

function makeId(l) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(var i = 0; i < l; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

exports.crop = function(path, name, success, failure) {
  gm(path).size(function(err, value) {
    if(err) {
      failure(err);
    } else {
      var url = config.assetsPath; // assets folder
      mkdirp(url, function(error) {
        if(error) {
          failure(error);
        }
        else {
          url += '/temp'; // assets/temp folder
          mkdirp(url, function(error) {
            if(error) {
              failure(error);
            }
            else {
              var croppedImagePath = url + '/' + makeId(8) + '.jpg';
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
        }
      });
    }
  });
};

module.exports = exports;