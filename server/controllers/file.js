var path = require('path');
var fs = require("fs");
var fse = require("fs-extra");
var request = require('request');
var rootPath = GLOBAL.ROOTPATH;
var mime = require('mime');
var gm = require('gm');
var exec = require('child_process').exec;
var pdfService = require('./../services/pdf');
var imageService = require('./../services/image');
var utilService = require('./../services/util');
var pushService = require('./../services/push');
var documentService = require('./../services/document');
var aws = require('./../services/aws');
var config = require('./../config');
var Promise = require('promise');
var _ = require('lodash');
var maxZoomLevel = 5;
var tileSize = 256;

function _downloadFile(key, destFile) {
  return new Promise(function(resolve, reject) {
    var file = fs.createWriteStream(destFile);
    file.on('close', function() {
      resolve();
    });
    aws.s3.getObject(key).createReadStream()
      .on('error', function(err) {
        reject();
      })
      .pipe(file);
  });
}

function getFileInfo(req, res) {
  var key = req.body.path;
  //var filePath = path.join(rootPath, relativePath);
  var fileExt = string.path(key).extension;
  var fileType = string.path(key).mimeType;
  var uuid = utilService.newGuidId();
  var fileName = string.path(key).name;
  var downloadDir = path.join(config.assetsPath, 'temp', uuid);
  var downloadedFile = path.join(downloadDir, fileName);
  utilService.ensureFolderExist(downloadDir);

  aws.s3.isExists(key)
    .then(function() {
      if(/(png|jpg|jpeg|bmp)/i.test(fileExt)) {
        _downloadFile(key, downloadedFile)
          .then(function() {
            gm(downloadedFile).size(function(err, value) {
              if(err) {
                res.status(400);
                res.send(err);
              } else {
                var imgWidth = value.width;
                var imgHeight = value.height;

                var stats = fs.statSync(downloadedFile);
                var fileSizeInBytes = stats["size"];

                res.send({
                  success: true,
                  type: fileType,
                  width: imgWidth,
                  height: imgHeight,
                  url: key,
                  size: fileSizeInBytes
                });
              }
            });
          });
      } else {
        res.status(400);
        res.send('File type not found for ' + fileExt);
      }
    }, function() {
      res.status(400);
      res.send('File not found!');
    });
}

function tryAgain(tryList, triedTime, cb) {
  var promises = [];
  _.each(tryList, function(el) {
    promises.push(imageService.tiles(el.input, el.size, el.zoom));
  });
  Promise.all(promises)
    .then(function() {
      cb();
    }, function(err) {
      console.log('Re-start images splicing (' + triedTime + ')...Failed!', err.message);
      if(triedTime < 3) {
        triedTime = triedTime + 1;
        tryAgain(err, triedTime, cb);
      }
    });
}

function updateConversionComplete(docId, baseRequest) {
  request({
      method: 'POST',
      body: {"projectFileId": docId, isConversionComplete: true, "baseRequest": baseRequest},
      json: true,
      url: config.PROXY_URL + '/upload/updateConversionComplete'
    },
    function(error, response, body) {
      if(!error && response.statusCode == 200) {
        console.log('Starting convert pdf to images progress...Done!');
      }
    });
}

function _uploadZoomsToS3(from, to) {
  return new Promise(function(resolve, reject) {
    console.log('Upload zoom images to S3 command: ' + 'aws s3 sync "' + from + '" "s3://' + config.aws_s3_bucket + '/' + to + '"');
    exec('aws s3 sync "' + from + '" "s3://' + config.aws_s3_bucket + '/' + to + '"', {maxBuffer: 1024 * 500} /* Increase max buffer to 500KB*/, function(error) {
      if(error) {
        console.log('Failed to upload zooms to S3!', from, 's3://' + config.aws_s3_bucket + '/' + to, error.message);
        resolve();
      }
      else {
        resolve();
      }
    });
  });
}

function _addPage(baseRequest, filePath, imagePath, documentId, cb) {
  return new Promise(function(resolve, reject) {
    gm(filePath).size(function(err, value) {
      if(err) {
        console.log(err.message);
        reject(err.message);
      } else {
        var imgWidth = value.width;
        var imgHeight = value.height;
        var stats = fs.statSync(filePath);
        var fileSizeInBytes = stats["size"];

        request({
            method: 'POST',
            body: {
              "projectFileId": documentId,
              projectFilePage: {
                "imagePath": imagePath,
                "imageName": string.path(imagePath).name,
                "imageType": string.path(imagePath).mimeType,
                "imageSize": fileSizeInBytes,
                "imageHeight": imgHeight,
                "imageWidth": imgWidth,
                "image": string.path(imagePath).extension.toLowerCase() === 'pdf' ? 'pdf' : 'image',
                "zoomLevel": 0,
                "createdBy": baseRequest.loggedInUserId
              },
              "baseRequest": baseRequest
            },
            json: true,
            url: config.PROXY_URL + '/upload/page/save'
          },
          function(error, response, body) {
            if(!error && response.statusCode == 200) {
              documentService.getDocumentById(documentId, baseRequest.loggedInUserProjectId, baseRequest)
                .then(function(doc) {
                  var currentPage = _.find(doc.projectFile.projectFilePageDTOs, {imagePath: imagePath});
                  cb(currentPage);
                  resolve();
                }, function(err) {
                  console.log('FAILED: ', err.message);
                  reject(err.message);
                });
            } else {
              console.log('FAILED: ', error.message);
              reject(error.message);
            }
          });
      }
    });
  });
}

function _updateZoomLevel(docId, baseRequest, pageData, level) {
  return new Promise(function(resolve, reject) {
    request({
        method: 'POST',
        body: {
          "projectFileId": docId,
          projectFilePage: {
            "projectFilePageId": pageData.projectFilePageId,
            "imagePath": pageData.imagePath,
            "imageName": pageData.imageName,
            "imageType": pageData.imageType,
            "imageSize": pageData.imageSize,
            "imageHeight": pageData.imageHeight,
            "imageWidth": pageData.imageWidth,
            "image": string.path(pageData.imagePath).extension.toLowerCase() === 'pdf' ? 'pdf' : 'image',
            "zoomLevel": level,
            "createdBy": baseRequest.loggedInUserId
          },
          "baseRequest": baseRequest
        },
        json: true,
        url: config.PROXY_URL + '/upload/page/save'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          resolve();
        } else {
          console.log('FAILED: ', error.message);
          reject(error.message);
        }
      });
  });
}

function convertPdfToImage(req, res) {
  var key = req.body.path;
  var uuid = utilService.newGuidId();
  var fileName = string.path(key).name;
  var fileNameWithout = string.path(key).nameOnly;
  var downloadDir = path.join(config.assetsPath, 'temp', uuid);
  var downloadedFile = path.join(downloadDir, fileName);
  utilService.ensureFolderExist(downloadDir);
  var relativePath = utilService.generateAssetPath('temp', null, null, fileName, uuid);
  var docId = req.body.docId;
  var baseRequest = req.body.baseRequest;
  var filePath = path.join(rootPath, relativePath);
  var fileFolder = path.join(rootPath, string.path(relativePath).baseDir);
  var fileFolderName = utilService.getFolderNameFromFile(path.basename(filePath));
  //var fileExt = path.extname(filePath);
  //var outputFolder = path.dirname(filePath);
  //var triedTime = 0;
  var promises = [];

  console.time('Downloading file from amazon S3');
  // Download file to local ?????
  _downloadFile(key, downloadedFile)
    .then(function() {
      console.timeEnd('Downloading file from amazon S3');
      console.log('Starting convert pdf to images progress...');
      if(/\.pdf$/.test(relativePath)) {
        console.log('Parsing pdf to images...');
        pdfService.parse(relativePath, key).then(function() {
          console.log('Parsing pdf to images...Done!');
          console.log('Starting images splicing...');
          console.time('ImagesSplicing');
          var folder = fs.readdirSync(path.join(fileFolder, fileFolderName, 'pages'));
          var pages = _.filter(folder, function(fn) {
            return fs.lstatSync(path.join(fileFolder, fileFolderName, 'pages', fn)).isFile();
          });
          var currentPage = 0;

          var _addCb = function(cPage) {
            var fp = path.join(fileFolder, fileFolderName, 'pages', pages[currentPage]);
            console.log('Adding page ' + (currentPage + 1) + ' to document...Done');
            console.log('Starting image splicing for page ' + (currentPage + 1) + '...');
            for(var size = 1; size <= maxZoomLevel; size++) {
              promises.push(imageService.tiles(fp, tileSize * Math.pow(2, size), size, tileSize, function(data) {
                if(data.zoom === maxZoomLevel) {
                  console.log('Starting image splicing for page ' + (currentPage + 1) + '...Done');
                }
                // Upload file to S3
                _uploadZoomsToS3(path.join(path.dirname(fp), data.tileFolder), string.join('/', string.path(key).baseDir, fileFolderName, 'pages', data.tileFolder))
                  .then(function() {
                    // Update zoom level to page
                    _updateZoomLevel(docId, baseRequest, cPage, data.zoom)
                      .then(function() {
                        // Send notifications
                        pushService.Pusher().trigger('onTarget', 'document.preview.' + docId, {
                          "name": "updateMaxNativeZoom",
                          "value": {
                            page: currentPage + 1,
                            maxNativeZoom: data.zoom
                          }
                        });
                      });
                  });
              }));
            }
          };

          var _finalCb = function() {
            Promise.all(promises)
              .then(function(resp) {
                console.log(resp);
                console.log('Starting images splicing...Done!');
                console.timeEnd('ImagesSplicing');
                updateConversionComplete(docId, baseRequest);
              }, function(err) {
                console.log('Starting images splicing...Failed!');
                //triedTime = triedTime + 1;
                //console.log('Re-start images splicing (' + triedTime + ')');
                //tryAgain(err, triedTime, function() {
                //  updateConversionComplete(docId, baseRequest);
                //});
              });
          };

          var _doAddPage = function(){
            console.log('Adding page ' + (currentPage + 1) + ' to document...');
            var fp = path.join(fileFolder, fileFolderName, 'pages', pages[currentPage]);
            _addPage(baseRequest, fp, string.join('/', string.path(key).baseDir, fileFolderName, 'pages', pages[currentPage]), docId, _addCb)
              .then(function() {
                currentPage++;
                if(currentPage < pages.length) {
                  _doAddPage();
                } else {
                  _finalCb();
                }
              });
          };

          _doAddPage();

        }, function(error) {
          console.log('Parsing pdf to images...Failed!', error.message);
          res.status(400);
          res.send(error);
        });

        res.send({
          success: true
        });
      }
      else {
        var fileNameFolder = utilService.getFolderNameFromFile(path.basename(filePath));
        var fileNameFolderPath = path.join(fileFolder, fileNameFolder);
        var pageFolder = path.join(fileNameFolderPath, 'pages');
        var fp = path.join(pageFolder, path.basename(filePath));

        // Create folder if not exists
        utilService.ensureFolderExist(fileNameFolderPath);
        utilService.ensureFolderExist(pageFolder);

        // Copy image file to folder to continue image splicing progress
        fse.copySync(filePath, fp);

        console.log('Making thumbnail...');
        var thumbnailName = fileNameWithout + '.thumb.jpg';
        var thumbnail = path.join(fileNameFolderPath, thumbnailName);
        var thumbnailPath = string.join('/', string.path(key).baseDir, fileNameFolder, thumbnailName);
        imageService.cropImageSquare(filePath, thumbnail, 200, function(err) {
          console.log('Making thumbnail...Done!');
          aws.s3.upload(fs.createReadStream(thumbnail), thumbnailPath)
            .then(function(data) {
              res.send({
                success: true
              });
            });
        });
        _addPage(baseRequest, filePath, string.join('/', string.path(key).baseDir, fileFolderName, 'pages', path.basename(filePath)), docId, function(currentPage) {
          console.log('Starting images splicing...');
          for(var size = 1; size <= maxZoomLevel; size++) {
            promises.push(
              imageService.tiles(
                path.join(pageFolder, fileName),
                tileSize * Math.pow(2, size),
                size,
                tileSize,
                function(data) {
                  // Upload file to S3
                  _uploadZoomsToS3(path.join(path.dirname(fp), data.tileFolder), string.join('/', string.path(key).baseDir, fileFolderName, 'pages', data.tileFolder))
                    .then(function() {
                      // Update zoom level to page
                      _updateZoomLevel(docId, baseRequest, currentPage, data.zoom)
                        .then(function() {
                          // Send notifications
                          pushService.Pusher().trigger('onTarget', 'document.preview.' + docId, {
                            "name": "updateMaxNativeZoom",
                            "value": {
                              page: 1,
                              maxNativeZoom: data.zoom
                            }
                          });
                        });
                    });
                }));
          }

          Promise.all(promises)
            .then(function(resp) {
              console.log(resp);
              console.log('Starting images splicing...Done!');
              updateConversionComplete(docId, baseRequest);
            }, function(err) {
              console.log('Starting images splicing...Failed!');
              //triedTime = triedTime + 1;
              //console.log('Re-start images splicing (' + triedTime + ')');
              //tryAgain(err, triedTime, function() {
              //  updateConversionComplete(docId, baseRequest);
              //});
            });
        });
      }
    }, function() {
      res.status(400);
      res.send('Cannot download file!');
    });

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
  var relativeExportedFilePath = string.path(relativePath).baseDir + '/converted_' + fileName + '.jpg';

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