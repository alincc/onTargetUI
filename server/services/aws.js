var exports = {}, s3 = {};
var Promise = require('promise');
var _ = require('lodash');
var config = require('./../config');
var AWS = require('aws-sdk');
var credentials = new AWS.SharedIniFileCredentials({profile: config.aws_s3_profile});
AWS.config.credentials = credentials;
var client = new AWS.S3({params: {Bucket: config.aws_s3_bucket}});

function generateNewFileName(filePath, files) {
  var fileName = string.path(filePath).name;
  var fileFolder = string.path(filePath).baseDir + '/';
  var fileNameWithoutExt = string.path(filePath).nameOnly;
  var fileExt = string.path(filePath).extension;
  var newName = fileName;
  var reg = new RegExp(fileNameWithoutExt + ' \\(\\d+\\)\\.' + fileExt + '$');
  var duplicates = _.filter(files, function(file) {
    return reg.test(file.Key);
  });
  if(duplicates.length <= 0) {
    newName = fileNameWithoutExt + ' (1).' + fileExt;
  } else {
    var lastDuplicateNumber = _.sortBy(duplicates).reverse()[0];
    var duplicateNumber = /.*\s+\((\d+)\)\./.exec(lastDuplicateNumber.Key)[1];
    if(duplicateNumber) {
      newName = fileNameWithoutExt + ' (' + (parseInt(duplicateNumber) + 1) + ').' + fileExt;
    }
  }
  return fileFolder + newName;
}


s3.upload = function(body, key, onprogress) {
  return new Promise(function(resolve, reject) {
    onprogress = onprogress || function() {
      };
    client.upload({Body: body, Key: key}).
      on('httpUploadProgress', onprogress).
      send(function(err, data) {
        if(err) {
          reject(err);
        }
        else {
          resolve(data);
        }
      });
  });
};

s3.getFiles = function(key) {
  return new Promise(function(resolve, reject) {
    client.listObjects({
      Delimiter: '/',
      Prefix: key
    }, function(err, data) {
      if(err) {
        //reject(err);
        resolve([]);
      }
      else {
        resolve(data.Contents);
      }
    });
  });
};

s3.getDirectories = function(key) {
  return new Promise(function(resolve, reject) {
    client.listObjects({
      Delimiter: '/',
      Prefix: key
    }, function(err, data) {
      console.log("Request to S3::");
      console.log(JSON.stringify(data));
      if(err) {
        //reject(err);
        console.log("Error while getting objects::");
        console.log(err);
        resolve([]);
      }
      else {
        resolve(data.CommonPrefixes);
      }
    });
  });
};

function _isExists(key) {
  return new Promise(function(resolve, reject) {
    if(/\/$/.test(key)) {
      // remove last splash
      var newKey = key.substring(0, key.length - 1);
      var parentFolder = string.path(newKey).baseDir + '/';
      // Folder
      client.listObjects({
        Delimiter: '/',
        Prefix: parentFolder
      }, function(err, data) {
        if(err) {
          //reject(err);
          reject();
        }
        else {
          var isExist = _.find(data.CommonPrefixes, {Prefix: key});
          if(isExist) {
            resolve();
          } else {
            reject();
          }
        }
      });
    } else {
      // File
      client.headObject({Key: key}, function(err, metadata) {
        if(err && err.code === 'NotFound') {
          // Handle no object on cloud here
          reject();
        } else {
          resolve();
        }
      });
    }
  });
}

s3.isExists = _isExists;

s3.getObject = function(key) {
  return client.getObject({Key: key});
};

s3.ensureFileNotExists = function(key, remove) {
  return new Promise(function(resolve, reject) {
    client.headObject({Key: key}, function(err, metadata) {
      if(err && err.code === 'NotFound') {
        // Handle no object on cloud here
        resolve(key);
      } else {
        var fileFolder = string.path(key).baseDir + '/';
        client.listObjects({
          Delimiter: '/',
          Prefix: fileFolder
        }, function(err, data) {
          if(err) {
            reject(err);
          }
          else {
            var newKey = generateNewFileName(key, data.Contents);
            resolve(newKey);
          }
        });
      }
    });
  });
};

s3.removeFileIfExists = function(key) {
  return new Promise(function(resolve, reject) {
    //_isExists(key)
    //  .then(
    //  function() {
    //    // Exists
    //    // Remove file
    //
    //  },
    //  function() {
    //    // No Exists
    //    resolve();
    //  })

    client.deleteObject({
      Key: key
    }, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject();
      }
      else{
        resolve();
      }
    });
  });
};

s3.current = function() {
  return client;
};

exports.s3 = s3;

module.exports = exports;