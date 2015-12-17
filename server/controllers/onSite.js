var path = require('path');
var fs = require("fs");
var fse = require('fs-extra');
var request = require('request');
var mime = require('mime');
var gm = require('gm');
var _ = require('lodash');
var rootPath = process.env.ROOT;
var exec = require('child_process').exec;
var config = require('./../config');
var aws = require('./../services/aws');
var utilService = require('./../services/util');
var imageService = require('./../services/image');
var documentService = require('./../services/document');
var Promise = require('promise');
var CryptoJS = require("crypto-js");
var key = config.downloadPathHashKey;
var cfg = {};

//function exportPdf(req, res) {
//  var imageUrl = req.body.path;
//  var docId = req.body.docId;
//  var baseRequest = req.body.baseRequest;
//  var markerUrl = 'server/assets/img/marker-icon.png';
//  var listGeo = req.body.geo;
//  var zoom = req.body.scale;
//  var exportFileName = req.body.fileName;
//  var imgWidth, imgHeight;
//  var projectAssetFolderName = req.body.projectAssetFolderName;
//
//  var convertPdfToImage = function() {
//    // Convert pdf to image
//    pdfService.parse('assets/projects/' + projectAssetFolderName + '/onsite/' + exportFileName, function() {
//      console.log('Update document conversation complete: ' + JSON.stringify({
//          "projectFileId": docId,
//          isConversionComplete: true,
//          "baseRequest": baseRequest
//        }));
//      request({
//        method: 'POST',
//        body: {"projectFileId": docId, isConversionComplete: true, "baseRequest": baseRequest},
//        json: true,
//        url: config.PROXY_URL + '/upload/updateConversionComplete'
//      });
//    });
//  };
//
//  var g = gm(path.join(rootPath, imageUrl)).size(function(err, size) {
//    var randomId = utilService.newGuidId();
//    if(!err) {
//      imgWidth = size.width;
//      imgHeight = size.height;
//      var scale = Math.pow(2, zoom);
//
//      function getOpacityStr(opt) {
//        return ('0' + Math.round((1 - opt) * 255).toString(16)).slice(-2);
//      }
//
//      for(var i = 0; i < listGeo.length; i++) {
//        var type = listGeo[i].geometry.type;
//        var coords = listGeo[i].geometry.coordinates;
//        var style = listGeo[i].options;
//        switch(type) {
//          case "Polygon":
//          {
//
//            var newCoordsStrPolygon = _.map(coords[0], function(d) {
//              d[0] = d[0] * scale;
//              d[1] = d[1] * scale;
//              d[1] = -d[1];
//              return d.join(',')
//            }).join(' ');
//            g = g.fill(style.color + getOpacityStr(style.fillOpacity)).stroke(style.color + getOpacityStr(style.opacity), style.weight);
//            g = g.draw('polygon', newCoordsStrPolygon);
//            break;
//          }
//          case "LineString":
//          {
//            var newCoordsStrLine = _.map(coords, function(d) {
//              d[0] = d[0] * scale;
//              d[1] = d[1] * scale;
//              d[1] = -d[1];
//              return d.join(',')
//            }).join(' ');
//            g = g.fill('transparent').stroke(style.color + getOpacityStr(style.opacity), style.weight);
//            g = g.draw('polyline', newCoordsStrLine);
//            break;
//          }
//          case "Point":
//          {
//            var radius = listGeo[i]._mRadius || 0;
//            radius = radius * 2 * scale;
//            coords[0] = coords[0] * scale;
//            coords[1] = coords[1] * scale;
//            coords[1] = -coords[1];
//            var coords2 = [coords[0] + radius, coords[1]];
//
//
//            if(radius > 0) {
//              g = g.fill(style.color + getOpacityStr(style.fillOpacity)).stroke(style.color + getOpacityStr(style.opacity), style.weight);
//              g = g.draw('circle', coords.join(',') + ' ' + coords2.join(','));
//            }
//            else {
//              // var imgPoint = gm('./../../assets/img/marker-icon.png');
//              // console.log('marker')
//              // g.in('-page', '+0+0')
//              // .in('marker-icon.png')
//            }
//            break;
//          }
//        }
//      }
//
//      var destinationPath1 = path.join(rootPath, 'assets', 'temp', randomId);
//      if(!fs.existsSync(destinationPath1)) {
//        fs.mkdirSync(destinationPath1);
//      }
//      var tmpName = 'tmp_' + randomId + '.jpg';
//      tmpName = path.join(destinationPath1, tmpName);
//
//      var destinationPath = path.join(rootPath, 'assets', 'projects', projectAssetFolderName);
//
//      if(!fs.existsSync(destinationPath)) {
//        fs.mkdirSync(destinationPath);
//      }
//      destinationPath = path.join(destinationPath, 'onsite');
//
//      if(!fs.existsSync(destinationPath)) {
//        fs.mkdirSync(destinationPath);
//      }
//      destinationPath = path.join(destinationPath, exportFileName);
//
//      //var returningPath = 'assets/projects/' + projectAssetFolderName + '/onsite/' + exportFileName;
//
//      g.write(tmpName, function() {
//        var newG = gm()
//          .in('-page', '+0+0')
//          .in(tmpName);
//        for(var i = 0; i < listGeo.length; i++) {
//          var type = listGeo[i].geometry.type;
//          var coords = listGeo[i].geometry.coordinates;
//          if(listGeo[i].type === 'marker') {
//            newG = newG.in('-page', '+' + coords[0] + '+' + coords[1])
//              .in(markerUrl);
//          }
//        }
//
//        newG.mosaic()  // Merges the images as a matrix
//          .write(tmpName, function(err) {
//            gm(tmpName).write(destinationPath, function() {
//              convertPdfToImage();
//            });
//          });
//      });
//    }
//  });
//
//  res.send({
//    success: true
//  });
//}

function exportPdf2(req, res) {
  var baseRequest = req.body.baseRequest;
  var data = req.body.data;
  var projectId = req.body.projectId;
  var docId = req.body.docId;
  console.log('Starting export image with markups, tagging to pdf...');
  documentService.getDocumentById(docId, projectId, baseRequest)
    .then(function(document) {
      docId = document.projectFile.fileId;
      var markerUrl = 'server/assets/img/marker-icon.png';
      var promises = [], errors = [], outputFolder = path.join(rootPath, 'assets', 'temp', utilService.newGuidId());

      // Create temp folder if not exists
      if(!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
      }

      // fn get opacity
      var getOpacityStr = function(opt) {
        return ('0' + Math.round((1 - opt) * 255).toString(16)).slice(-2);
      };

      console.log('Starting merge markups, tags to images...');
      // loop pages
      _.each(data, function(el, pageIndex) {
        promises.push(new Promise(function(resolve, reject) {
          var imageUrl = el.imagePath;
          var listGeo = el.layers;
          var imgWidth, imgHeight;
          console.log('Merging markups, tags to image "' + imageUrl + '"...');
          var g = gm(path.join(rootPath, imageUrl))
            .size(function(err, size) {
              if(!err) {
                imgWidth = size.width;
                imgHeight = size.height;
                //var scale = Math.pow(2, zoom);
                var scale = imgWidth;
                if(imgHeight > imgWidth) {
                  scale = imgHeight;
                }
                //var scale = Math.log(imgWidth / 512) / Math.log(2);
                if(el.layers) {
                  for(var i = 0; i < listGeo.length; i++) {
                    var type = listGeo[i].geometry.type;
                    var coords = listGeo[i].geometry.coordinates;
                    var style = listGeo[i].options;
                    switch(type) {
                      case "Polygon":
                      {
                        var newCoordsStrPolygon = _.map(coords[0], function(d) {
                          d[0] = d[0] * scale;
                          d[1] = d[1] * scale;
                          //d[1] = -d[1];
                          return d.join(',')
                        }).join(' ');
                        g = g.fill(style.color + getOpacityStr(style.fillOpacity)).stroke(style.color + getOpacityStr(style.opacity), style.weight);
                        g = g.draw('polygon', newCoordsStrPolygon);
                        break;
                      }
                      case "LineString":
                      {
                        var newCoordsStrLine = _.map(coords, function(d) {
                          d[0] = d[0] * scale;
                          d[1] = d[1] * scale;
                          //d[1] = -d[1];
                          return d.join(',')
                        }).join(' ');
                        g = g.fill('transparent').stroke(style.color + getOpacityStr(style.opacity), style.weight);
                        g = g.draw('polyline', newCoordsStrLine);
                        break;
                      }
                      case "Point":
                      {
                        var radius = listGeo[i]._mRadius || 0;
                        radius = radius * 2 * scale;
                        coords[0] = coords[0] * scale;
                        coords[1] = coords[1] * scale;
                        //coords[1] = -coords[1];
                        var coords2 = [coords[0] + radius, coords[1]];


                        if(radius > 0) {
                          g = g.fill(style.color + getOpacityStr(style.fillOpacity)).stroke(style.color + getOpacityStr(style.opacity), style.weight);
                          g = g.draw('circle', coords.join(',') + ' ' + coords2.join(','));
                        }
                        else {
                          // var imgPoint = gm('./../../assets/img/marker-icon.png');
                          // console.log('marker')
                          // g.in('-page', '+0+0')
                          // .in('marker-icon.png')
                        }
                        break;
                      }
                    }
                  }
                }
                var tmpName = path.join(outputFolder, pageIndex + '.jpg');

                g.write(tmpName, function(err) {
                  if(err) {
                    console.log('Merging markups to image "' + imageUrl + '"...Failed!', err.message);
                    errors.push(err.message);
                    reject(err);
                  } else {
                    var newG = gm()
                      .in('-page', '+0+0')
                      .in(tmpName);
                    if(el.layers) {
                      for(var i = 0; i < listGeo.length; i++) {
                        var type = listGeo[i].geometry.type;
                        var coords = listGeo[i].geometry.coordinates;
                        if(listGeo[i].type === 'marker') {
                          newG = newG.in('-page', '+' + coords[0] + '+' + coords[1])
                            .in(markerUrl);
                        }
                      }
                    }
                    newG.mosaic()  // Merges the images as a matrix
                      .write(tmpName, function(err) {
                        if(err) {
                          console.log('Merging tags to image "' + imageUrl + '"...Failed!');
                          errors.push(err.message);
                          reject(err);
                        }
                        else {
                          console.log('Merging markups, tags to image "' + imageUrl + '"...Done!');
                          resolve();
                        }
                        //gm(tmpName).write(destinationPath, function() {
                        //  convertPdfToImage();
                        //});
                      });
                  }
                });
              }
            });
        }));
      });

      // all promises are resolved
      Promise.all(promises)
        .then(function(data) {
          console.log(data);
          if(errors.length) {
            console.log('Starting export image with markups, tags to pdf...Failed!');
            console.log(errors.join(', '));
          }
          else {
            console.log('Starting merge markups, tags to images...Done!');
            if(/\.pdf$/.test(document.projectFile.filePath)) {
              // convert pdf pages to images
              console.log('Merging images to pdf...');
              console.time("MergingImagesToPdf");
              exec(config.convertCommand + ' "' + outputFolder + '/*" -units "PixelsPerInch" -density 300 -compress jpeg "' + path.join(rootPath, document.projectFile.filePath) + '"', function(error) {
                console.timeEnd("MergingImagesToPdf");
                if(error) {
                  console.log('Error while converting pdf to image', error.message);
                }
                else {
                  console.log('Merge images to pdf successful!');
                  var firstPage = fs.readdirSync(outputFolder)[0];
                  if(firstPage) {
                    var filePath = path.join(rootPath, document.projectFile.filePath);
                    var fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
                    var folder = path.join(path.dirname(filePath), utilService.getFolderNameFromFile(path.basename(filePath)));
                    var thumbnail = path.join(folder, fileNameWithoutExt + '.thumb.jpg');
                    if(!fs.existsSync(folder)) {
                      fs.mkdirSync(folder);
                    }
                    console.log('Makig thumbnail...');
                    imageService.cropImageSquare(path.join(outputFolder, firstPage), thumbnail, 200, function(err) {
                      if(err) {
                        console.log('Failed to create image thumbnail!', error.message);
                      }
                      else {
                        console.log('Updating document status');
                        request({
                          method: 'POST',
                          body: {"projectFileId": docId, isConversionComplete: true, "baseRequest": baseRequest},
                          json: true,
                          url: config.PROXY_URL + '/upload/updateConversionComplete'
                        }, function(err) {
                          if(!err) {
                            console.log('Update document status successful!');
                            console.log('Starting export image with markups, tags to pdf...Done!');
                          }
                        });
                      }
                    });
                  }

                  // Convert pdf to image
                  //pdfService.parse(document.projectFile.filePath).then(function() {
                  //  // Update document status
                  //  console.log('Convert pdf to images successful!');
                  //  console.log('Updating document status');
                  //  request({
                  //    method: 'POST',
                  //    body: {"projectFileId": docId, isConversionComplete: true, "baseRequest": baseRequest},
                  //    json: true,
                  //    url: config.PROXY_URL + '/upload/updateConversionComplete'
                  //  }, function(err) {
                  //    if(!err) {
                  //      console.log('Update document status successful!');
                  //      //documentService.getDocumentById(document.projectFile.parentProjectFileId, projectId, baseRequest)
                  //      //  .then(function(parentDocument) {
                  //      //    //console.log('Copy images from parent document');
                  //      //    //// Copy parent images to version
                  //      //    //var filePath = path.join(rootPath, response.body.projectFile.filePath);
                  //      //    //var fileFolder = path.join(rootPath, response.body.projectFile.filePath.substring(0, response.body.projectFile.filePath.lastIndexOf('/')));
                  //      //    //var folder = path.join(fileFolder, utilService.getFolderNameFromFile(path.basename(filePath)));
                  //      //    //var pageFolder = path.join(folder, 'pages');
                  //      //    //
                  //      //    //var fileDesPath = path.join(rootPath, document.projectFile.filePath);
                  //      //    //var fileDesFolder = path.join(rootPath, document.projectFile.filePath.substring(0, document.projectFile.filePath.lastIndexOf('/')));
                  //      //    //var destinationFolder = path.join(fileDesFolder, utilService.getFolderNameFromFile(path.basename(fileDesPath)));
                  //      //    //var destPageFolder = path.join(destinationFolder, 'pages');
                  //      //    //
                  //      //    //if(!fs.existsSync(destinationFolder)) {
                  //      //    //  fs.mkdirSync(destinationFolder);
                  //      //    //}
                  //      //    //
                  //      //    //if(!fs.existsSync(destPageFolder)) {
                  //      //    //  fs.mkdirSync(destPageFolder);
                  //      //    //}
                  //      //    //
                  //      //    //var oldImage = fs.readdirSync(destPageFolder);
                  //      //    //_.each(oldImage, function(el) {
                  //      //    //  fs.unlinkSync(path.join(destPageFolder, el));
                  //      //    //});
                  //      //    //
                  //      //    //var images = fs.readdirSync(pageFolder);
                  //      //    //_.each(images, function(el) {
                  //      //    //  fse.copySync(pageFolder, destPageFolder);
                  //      //    //});
                  //      //  });
                  //    }
                  //  });
                  //}, function(err) {
                  //  console.log('Failed to parse pdf to images', err.message);
                  //});
                }
              });
            }
            else {
              var tempFile = fs.readdirSync(outputFolder)[0];
              if(tempFile) {
                var tempFilePath = path.join(outputFolder, tempFile);
                var filePath = path.join(rootPath, document.projectFile.filePath);
                var fileFolder = path.join(rootPath, string.path(document.projectFile.filePath).baseDir);
                //var folder = path.join(fileFolder, utilService.getFolderNameFromFile(path.basename(filePath)));
                var fileExt = path.extname(filePath);
                var fileName = path.basename(filePath, fileExt);
                var thumbnail = path.join(fileFolder, fileName + '.thumb.jpg');
                fse.copySync(tempFilePath, filePath);

                imageService.cropImageSquare(filePath, thumbnail, 200, function(err) {
                  if(!err) {
                    request({
                      method: 'POST',
                      body: {"projectFileId": docId, isConversionComplete: true, "baseRequest": baseRequest},
                      json: true,
                      url: config.PROXY_URL + '/upload/updateConversionComplete'
                    }, function(err) {
                      if(err) {
                        console.log(err);
                      }
                    });
                  }
                });
              }
            }
          }
        });

      res.send({
        success: true
      });
    }, function(err) {
      res.status(400);
      res.send(err.message);
    });
}

function getNextVersionName(req, res) {
  var totalVersions = req.body.totalVersions;
  var filePath = req.body.path;
  var fileName = string.path(filePath).name;
  var fileNameWithoutExt = string.path(filePath).nameOnly;
  var fileExt = string.path(filePath).extension;
  var fullFilePath = string.join('/', rootPath, filePath);
  var versionName = string.path(filePath).baseDir;
  var reg = new RegExp(fileNameWithoutExt + '\\_v\\d+\\.' + fileExt + '$');

  res.send({
    success: true,
    newVersionName: string.join('/', versionName, fileNameWithoutExt + '_v' + (parseInt(totalVersions) + 1) + '.' + fileExt)
  });

  //if(fs.existsSync(fullFilePath)) {
  //  //var files = fs.readdirSync(path.join(fullFilePath.substring(0, fullFilePath.lastIndexOf('/'))));
  //  //var versions = _.filter(files, function(file) {
  //  //  return reg.test(file);
  //  //});
  //  //if(versions.length <= 0) {
  //  //  versionName = versionName + '/' + fileNameWithoutExt + '_v1.' + fileExt;
  //  //} else {
  //  //  var lastVersionName = _.sortBy(versions).reverse()[0];
  //  //  var versionNumber = /.*_v(\d+)\./.exec(lastVersionName)[1];
  //  //  lastVersionName = lastVersionName.substring(0, lastVersionName.lastIndexOf('_v'));
  //  //  if(versionNumber) {
  //  //    versionName = versionName + '/' + lastVersionName + '_v' + (parseInt(versionNumber) + 1) + '.' + fileExt;
  //  //  }
  //  //}
  //  //
  //  //res.send({
  //  //  success: true,
  //  //  newVersionName: versionName
  //  //});
  //  res.send({
  //    success: true,
  //    newVersionName: string.join('/', versionName, fileNameWithoutExt + '_v' + (parseInt(totalVersions) + 1) + '.' + fileExt)
  //  });
  //} else {
  //  res.status(400);
  //  res.send('File not found!');
  //}
}

function _getPages(relativePath) {
  return new Promise(function(resolve, reject) {
    var filePath = path.join(rootPath, relativePath);
    //var fileFolder = path.join(rootPath, relativePath.substring(0, relativePath.lastIndexOf('/')));
    var fileName = path.basename(filePath);
    var fileFolderName = utilService.getFolderNameFromFile(fileName);
    //var folder = path.join(fileFolder, fileFolderName);
    //var pageFolder = path.join(folder, 'pages');
    //var makePath = function(name) {
    //  return relativePath.substring(0, relativePath.lastIndexOf('/')) + '/' + fileFolderName + '/pages/' + name;
    //};

    aws.s3.getFiles(string.join('/', string.path(relativePath).baseDir, fileFolderName, 'pages/'))
      .then(function(files) {
        resolve(_.map(files, function(el) {
          return el.Key;
        }));
      });
  });
}

function getPages(req, res) {
  var relativePath = req.body.path;
  var filePath = path.join(rootPath, relativePath);
  //var fileFolder = path.join(rootPath, relativePath.substring(0, relativePath.lastIndexOf('/')));
  //var fileExt = path.extname(filePath);
  var fileName = path.basename(filePath);
  //var fileNameWithoutExt = path.basename(filePath, fileExt);
  var fileFolderName = utilService.getFolderNameFromFile(fileName);
  //var folder = path.join(fileFolder, fileFolderName);
  //var pageFolder = path.join(folder, 'pages');
  //var destinationFilePath = path.join(folder, 'pages', fileNameWithoutExt + '.jpg');
  var sendResult = function(pages) {
    res.send({
      success: true,
      pages: pages
    });
  };
  //var makePath = function(name) {
  //  return relativePath.substring(0, relativePath.lastIndexOf('/')) + '/' + utilService.getFolderNameFromFile(fileName) + '/pages/' + name;
  //};

  // file folder
  aws.s3.isExists(string.join('/', string.path(relativePath).baseDir, fileFolderName + '/'))
    .then(function() {
      // Pages folder
      aws.s3.isExists(string.join('/', string.path(relativePath).baseDir, fileFolderName, 'pages/'))
        .then(function() {
          // Exist
          _getPages(relativePath)
            .then(function(pages) {
              sendResult(pages);
            });
        }, function() {
          sendResult([]);
        })
    }, function() {
      sendResult([]);
    });
  //var files = _.filter(fs.readdirSync(pageFolder), function(fileName) {
  //  return fs.lstatSync(path.join(pageFolder, fileName)).isFile();
  //});
  //if(files.length === 1) {
  //  sendResult([makePath(files[0])]);
  //}
  //else if(files.length > 1) {
  //  var pages = [];
  //  _.each(files, function(el) {
  //    pages.push(makePath(el));
  //  });
  //  sendResult(pages);
  //}
  //else {
  //  sendResult([]);
  //}
}

function _isZoomLoaded(prefix, zoomLevel) {
  return new Promise(function(resolve, reject) {
    // Check if the zoom folder have loaded.txt file
    aws.s3.isExists(prefix + 'loaded.txt')
      .then(function() {
        // If exists loaded.txt that mean the zoom level is fully loaded
        resolve({
          zoomLevel: zoomLevel,
          ready: true
        });
      }, function() {
        // Otherwise, zoom level not ready yet
        resolve({
          zoomLevel: zoomLevel,
          ready: false
        });
      });
  });
}

function _checkZoomLevel(key, pageIndex) {
  return new Promise(function(resolve, reject) {
    var promises = [];
    // Zoom folders
    aws.s3.getDirectories(key)
      .then(function(zoomFolders) {
        _.each(zoomFolders, function(el, zoomLevel) {
          promises.push(_isZoomLoaded(el.Prefix, zoomLevel));
        });

        Promise.all(promises)
          .then(function(results) {
            var zoomLevel = 0;
            for(var i = 0; i < results.length; i++) {
              if(!results[i].ready) {
                break;
              } else {
                zoomLevel = i + 1;
              }
            }
            resolve({
              page: pageIndex + 1,
              zoomLevel: zoomLevel
            });
          });
      });
  });
}

function getZoomLevel(req, res) {
  var relativePath = req.body.path;
  var filePath = path.join(rootPath, relativePath);
  //var fileFolder = path.join(rootPath, relativePath.substring(0, relativePath.lastIndexOf('/')));
  //var fileExt = path.extname(filePath);
  var fileName = path.basename(filePath);
  //var fileNameWithoutExt = path.basename(filePath, fileExt);
  var fileFolderName = utilService.getFolderNameFromFile(fileName);
  //var folder = path.join(fileFolder, fileFolderName);
  //var pageFolder = path.join(folder, 'pages');
  //var results = [];
  //var pageNumber = 1;
  //var zoomLevel = 0;

  var pagePromises = [];

  // Get pages
  aws.s3.getDirectories(string.join('/', string.path(relativePath).baseDir, fileFolderName, 'pages/'))
    .then(function(pages) {
      _.each(pages, function(el, pageIndex) {
        // Pages
        pagePromises.push(_checkZoomLevel(el.Prefix, pageIndex));
      });

      Promise.all(pagePromises)
        .then(function(results) {
          res.send(results);
        });
    });
}

function checkFileStatus(req, res) {
  //var status = "UnProceeded";
  var relativePath = req.body.path;
  var filePath = path.join(rootPath, relativePath);
  //var fileFolder = path.join(rootPath, relativePath.substring(0, relativePath.lastIndexOf('/')));
  //var fileExt = path.extname(filePath);
  var fileName = path.basename(filePath);
  //var fileNameWithoutExt = path.basename(filePath, fileExt);
  //var folder = path.join(fileFolder, utilService.getFolderNameFromFile(fileName));
  //var pageFolder = path.join(folder, 'pages');

  // Check pages object is exist (folder)
  aws.s3.isExists(relativePath)
    .then(function() {
      aws.s3.isExists(string.join('/', string.path(relativePath).baseDir, utilService.getFolderNameFromFile(fileName), 'pages/'))
        .then(function() {
          // Exist
          res.send({
            success: true,
            status: "Done"
          });
        }, function() {
          // Not exist
          res.send({
            success: true,
            status: "UnProceeded"
          });
        });
    }, function() {
      res.send({
        success: true,
        status: "NotExist"
      });
    });
}

function generateThumbnail(req, res) {

}

function downloadFile(req, res) {
  var id = req.body.id,
    baseRequest = req.body.baseRequest,
    projectId = req.body.projectId;
  id = id.replace(/\s/g, '+');
  id = CryptoJS.AES.decrypt(id, key, cfg).toString(CryptoJS.enc.Utf8);
  id = parseInt(id);
  console.log('Start download file with id: ' + id);
  console.log('Getting document...');
  documentService.getDocumentById(id, projectId, baseRequest)
    .then(function(document) {
      console.log('Getting document...Done!');
      // document.projectFile
      var markerUrl = 'server/assets/img/marker-icon.png';
      var promises = [], errors = [], outputFolder = path.join(rootPath, 'assets', 'temp', utilService.newGuidId()), tmpFileName = utilService.newGuidId(), data = [], pages = [];

      utilService.ensureFolderExist(outputFolder);

      var failure = function(errorMessage) {
        res.status(400);
        res.send(errorMessage);
      };

      // fn get opacity
      var getOpacityStr = function(opt) {
        return ('0' + Math.round((1 - opt) * 255).toString(16)).slice(-2);
      };

      var getDocumentTags = function(cb) {
        documentService.getDocumentTags(id, baseRequest)
          .then(function(documentTags) {
            cb(documentTags.tags);
          }, function(err) {
            // Error
            failure(err.message);
          });
      };

      var extractTags = function(tags) {
        // Extract tags
        _.each(tags, function(el) {
          var pageNumber = /.*\|\sPage\-(\d+)/.exec(el.title)[1];
          if(typeof pageNumber !== "undefined" && pageNumber !== null) {
            pageNumber = parseInt(pageNumber);
            if(data[pageNumber - 1]) {
              if(!data[pageNumber - 1].tagList) {
                data[pageNumber - 1].tagList = [];
              }
              data[pageNumber - 1].tagList.push(el);
            }
          }
        });
      };

      var parseTagsToCoordinates = function() {
        try {
          _.each(data, function(dt) {
            console.log(dt.imagePath);
            _.each(dt.tagList, function(tag) {
              var layer = {};
              var attrs = tag.attributes;
              // Get type
              var type = _.filter(attrs, function(a) {
                return a.key === 'type';
              });
              if(type.length) {
                var t = type[0].value, geo, coords;
                layer.type = t;
                layer.geometry = {
                  type: t === "circle" ? "Point" :
                    t === "polygon" ? "Polygon" :
                      t === "polyline" ? "LineString" :
                        t === "marker" ? "Marker" : "Rectangle"
                };

                layer.options = _.reduce(attrs, function(memo, a) {
                  if(/^options\./.test(a.key)) {
                    var keys = a.key.split('.')[1], value = a.value;
                    memo[keys] = value;
                  }
                  return memo;
                }, {});

                var r = _.find(attrs, {"key": "_mRadius"});
                layer._mRadius = r ? parseFloat(r.value) : 0;

                switch(t) {
                  case 'rectangle':
                  {
                    geo = _.filter(attrs, function(a) {
                      return /^geo\./.test(a.key);
                    });
                    coords = _.reduce(geo, function(memo, g) {
                      var key = g.key,
                        value = parseFloat(g.value);
                      var info = key.split('.'), id = parseFloat(info[1]), id2 = parseFloat(info[2]);
                      if(memo[id]) {
                        memo[id][id2] = value;
                      } else {
                        var obj = [];
                        obj[id2] = value;
                        memo[id] = obj;
                      }
                      return memo;
                    }, []);
                    layer.geometry.coordinates = coords;
                    break;
                  }
                  case 'polygon':
                  {
                    geo = _.filter(attrs, function(a) {
                      return /^geo\./.test(a.key);
                    });
                    coords = _.reduce(geo, function(memo, g) {
                      var key = g.key,
                        value = parseFloat(g.value);
                      var info = key.split('.'), id = parseFloat(info[1]), id2 = parseFloat(info[2]);
                      if(memo[id]) {
                        memo[id][id2] = value;
                      } else {
                        var obj = [];
                        obj[id2] = value;
                        memo[id] = obj;
                      }
                      return memo;
                    }, []);
                    layer.geometry.coordinates = coords;
                    break;
                  }
                  case 'polyline':
                  {
                    geo = _.filter(attrs, function(a) {
                      return /^geo\./.test(a.key);
                    });
                    coords = _.reduce(geo, function(memo, g) {
                      var key = g.key,
                        value = parseFloat(g.value);
                      var info = key.split('.'), id = parseFloat(info[1]), id2 = parseFloat(info[2]);
                      if(memo[id]) {
                        memo[id][id2] = value;
                      } else {
                        var obj = [];
                        obj[id2] = value;
                        memo[id] = obj;
                      }
                      return memo;
                    }, []);
                    layer.geometry.coordinates = coords;
                    break;
                  }
                  case 'circle':
                  {
                    var radius = _.filter(attrs, function(a) {
                      return /^radius/.test(a.key);
                    });
                    var circleRadius = 0;
                    if(radius.length) {
                      circleRadius = parseFloat(radius[0].value);
                    }
                    geo = _.filter(attrs, function(a) {
                      return /^geo\./.test(a.key);
                    });
                    coords = _.reduce(geo, function(memo, g) {
                      var key = g.key,
                        value = parseFloat(g.value);
                      var info = key.split('.'), id = parseFloat(info[1]), id2 = parseFloat(info[2]);
                      if(memo[id]) {
                        memo[id][id2] = value;
                      } else {
                        var obj = [];
                        obj[id2] = value;
                        memo[id] = obj;
                      }
                      return memo;
                    }, []);
                    layer.geometry.coordinates = coords[0];
                    break;
                  }
                  case 'marker':
                  {
                    geo = _.filter(attrs, function(a) {
                      return /^geo\./.test(a.key);
                    });
                    coords = _.reduce(geo, function(memo, g) {
                      var key = g.key,
                        value = parseFloat(g.value);
                      var info = key.split('.'), id = parseFloat(info[1]), id2 = parseFloat(info[2]);
                      if(memo[id]) {
                        memo[id][id2] = value;
                      } else {
                        var obj = [];
                        obj[id2] = value;
                        memo[id] = obj;
                      }
                      return memo;
                    }, []);
                    layer.geometry.coordinates = coords;
                    break;
                  }
                }
              }

              if(!dt.layers) {
                dt.layers = []
              }
              dt.layers.push(layer);
            });
          });
        }
        catch(err) {
          console.log(err);
        }
      };

      var updateConversionProgress = function(docId, baseRequest) {
        request({
          method: 'POST',
          body: {"projectFileId": docId, isConversionComplete: true, "baseRequest": baseRequest},
          json: true,
          url: config.PROXY_URL + '/upload/updateConversionComplete'
        }, function(err) {
          if(err) {
            console.log(err);
          }
        });
      };

      var exportFile = function(document, filePath) {

        console.log('Getting pdf images...');
        pages = _getPages(filePath)
          .then(function(p) {
            pages = p;
            console.log('Getting pdf images...Done');

            console.log('Generating data...');
            // Combine data
            data = _.map(pages, function(p) {
              return {
                imagePath: p,
                maxZoom: 5,
                layers: []
              };
            });
            console.log('Generating data...Done');
            console.log('Getting document tags...');
            getDocumentTags(function(tags) {
              console.log('Getting document tags...Done');
              console.log('Extracting document tags...');
              extractTags(tags);
              console.log('Extracting document tags...Done');
              console.log('Parsing document tags to coordinates...');
              parseTagsToCoordinates();
              console.log('Parsing document tags to coordinates...Done');
              console.log('Starting merge markups, tags to images...');
              // loop pages
              _.each(data, function(el, pageIndex) {
                promises.push(new Promise(function(resolve, reject) {
                  var imageUrl = el.imagePath;
                  var listGeo = el.layers;
                  var imgWidth, imgHeight;
                  console.log('Merging markups, tags to image "' + imageUrl + '"...');
                  var g = gm(path.join(rootPath, imageUrl))
                    .size(function(err, size) {
                      if(!err) {
                        imgWidth = size.width;
                        imgHeight = size.height;
                        //var scale = Math.pow(2, zoom);
                        var scale = imgWidth;
                        if(imgHeight > imgWidth) {
                          scale = imgHeight;
                        }
                        /*Math.log(imgWidth / 512) / Math.log(2)*/
                        if(el.layers) {
                          for(var i = 0; i < listGeo.length; i++) {
                            var type = listGeo[i].geometry.type;
                            var coords = listGeo[i].geometry.coordinates;
                            var style = listGeo[i].options;
                            switch(type) {
                              case "Rectangle":
                              {
                                var newCoordsStrRectangle = _.map(coords, function(d) {
                                  var p = [];
                                  p[0] = d[1] * scale;
                                  p[1] = d[0] * scale;
                                  return p.join(',')
                                }).join(' ');
                                g = g.fill(style.color + getOpacityStr(style.fillOpacity)).stroke(style.color + getOpacityStr(style.opacity), style.weight);
                                g = g.draw('polygon', newCoordsStrRectangle);
                                break;
                              }
                              case "Polygon":
                              {
                                var newCoordsStrPolygon = _.map(coords, function(d) {
                                  var p = [];
                                  p[0] = d[1] * scale;
                                  p[1] = d[0] * scale;
                                  return p.join(',')
                                }).join(' ');
                                g = g.fill(style.color + getOpacityStr(style.fillOpacity)).stroke(style.color + getOpacityStr(style.opacity), style.weight);
                                g = g.draw('polygon', newCoordsStrPolygon);
                                break;
                              }
                              case "LineString":
                              {
                                var newCoordsStrLine = _.map(coords, function(d) {
                                  var p = [];
                                  p[0] = d[1] * scale;
                                  p[1] = d[0] * scale;
                                  return p.join(',')
                                }).join(' ');
                                g = g.fill('transparent').stroke(style.color + getOpacityStr(style.opacity), style.weight);
                                g = g.draw('polyline', newCoordsStrLine);
                                break;
                              }
                              case "Point":
                              {
                                var radius = listGeo[i]._mRadius || 0;
                                radius = radius * 2 * scale;
                                var p1 = [];
                                p1[0] = coords[1] * scale;
                                p1[1] = coords[0] * scale;
                                var coords2 = [p1[0] + radius, p1[1]];


                                if(radius > 0) {
                                  g = g.fill(style.color + getOpacityStr(style.fillOpacity)).stroke(style.color + getOpacityStr(style.opacity), style.weight);
                                  g = g.draw('circle', p1.join(',') + ' ' + coords2.join(','));
                                }
                                else {
                                  // var imgPoint = gm('./../../assets/img/marker-icon.png');
                                  // console.log('marker')
                                  // g.in('-page', '+0+0')
                                  // .in('marker-icon.png')
                                }
                                break;
                              }
                            }
                          }
                        }
                        var tmpName = path.join(outputFolder, pageIndex + '.jpg');

                        g.write(tmpName, function(err) {
                          if(err) {
                            console.log('Merging markups to image "' + imageUrl + '"...Failed!', err.message);
                            errors.push(err.message);
                            resolve(err);
                          } else {
                            var newG = gm()
                              .in('-page', '+0+0')
                              .in(tmpName);
                            if(el.layers) {
                              for(var i = 0; i < listGeo.length; i++) {
                                var type = listGeo[i].geometry.type;
                                var coords = listGeo[i].geometry.coordinates[0];
                                if(coords && listGeo[i].type === 'marker') {
                                  newG = newG.in('-page', '+' + (coords[1] * scale) + '+' + (coords[0] * scale))
                                    .in(markerUrl);
                                }
                              }
                            }
                            newG.mosaic()  // Merges the images as a matrix
                              .write(tmpName, function(err) {
                                if(err) {
                                  console.log('Merging tags to image "' + imageUrl + '"...Failed!');
                                  errors.push(err.message);
                                  resolve(err);
                                }
                                else {
                                  console.log('Merging markups, tags to image "' + imageUrl + '"...Done!');
                                  resolve();
                                }
                                //gm(tmpName).write(destinationPath, function() {
                                //  convertPdfToImage();
                                //});
                              });
                          }
                        });
                      }
                    });
                }));
              });
              // all promises are resolved
              Promise.all(promises)
                .then(function(data) {
                  if(errors.length) {
                    console.log(data);
                    console.log('Starting export image with markups, tags to pdf...Failed!');
                    failure("Cannot download the file!");
                  }
                  else {
                    console.log('Starting merge markups, tags to images...Done!');
                    if(/\.pdf$/.test(document.projectFile.filePath)) {
                      // convert pdf pages to images
                      console.log('Merging images to pdf...');
                      console.time("MergingImagesToPdf");
                      exec(config.convertCommand + ' "' + outputFolder + '/*" -units "PixelsPerInch" -density 300 -compress jpeg "' + path.join(rootPath, document.projectFile.filePath) + '"', function(error) {
                        console.timeEnd("MergingImagesToPdf");
                        if(error) {
                          console.log('Error while converting pdf to image', error.message);
                          failure(error.message);
                        }
                        else {
                          console.log('Merge images to pdf successful!');
                          console.log('Exporting document to pdf...Done');
                          res.send({
                            success: true,
                            filePath: document.projectFile.filePath
                          });
                          //var firstPage = fs.readdirSync(outputFolder)[0];
                          //if(firstPage) {
                          //  var filePath = path.join(rootPath, document.projectFile.filePath);
                          //  var fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
                          //  var folder = path.join(path.dirname(filePath), utilService.getFolderNameFromFile(path.basename(filePath)));
                          //  var thumbnail = path.join(folder, fileNameWithoutExt + '.thumb.jpg');
                          //  if(!fs.existsSync(folder)) {
                          //    fs.mkdirSync(folder);
                          //  }
                          //  console.log('Making thumbnail...');
                          //  imageService.cropImageSquare(path.join(outputFolder, firstPage), thumbnail, 200, function(err) {
                          //    if(err) {
                          //      console.log('Failed to create image thumbnail!', error.message);
                          //    }
                          //    else {
                          //      console.log('Updating document status');
                          //      request({
                          //        method: 'POST',
                          //        body: {"projectFileId": docId, isConversionComplete: true, "baseRequest": baseRequest},
                          //        json: true,
                          //        url: config.PROXY_URL + '/upload/updateConversionComplete'
                          //      }, function(err) {
                          //        if(!err) {
                          //          console.log('Update document status successful!');
                          //          console.log('Starting export image with markups, tags to pdf...Done!');
                          //        }
                          //      });
                          //    }
                          //  });
                          //}

                          // Convert pdf to image
                          //pdfService.parse(document.projectFile.filePath).then(function() {
                          //  // Update document status
                          //  console.log('Convert pdf to images successful!');
                          //  console.log('Updating document status');
                          //  request({
                          //    method: 'POST',
                          //    body: {"projectFileId": docId, isConversionComplete: true, "baseRequest": baseRequest},
                          //    json: true,
                          //    url: config.PROXY_URL + '/upload/updateConversionComplete'
                          //  }, function(err) {
                          //    if(!err) {
                          //      console.log('Update document status successful!');
                          //      //documentService.getDocumentById(document.projectFile.parentProjectFileId, projectId, baseRequest)
                          //      //  .then(function(parentDocument) {
                          //      //    //console.log('Copy images from parent document');
                          //      //    //// Copy parent images to version
                          //      //    //var filePath = path.join(rootPath, response.body.projectFile.filePath);
                          //      //    //var fileFolder = path.join(rootPath, response.body.projectFile.filePath.substring(0, response.body.projectFile.filePath.lastIndexOf('/')));
                          //      //    //var folder = path.join(fileFolder, utilService.getFolderNameFromFile(path.basename(filePath)));
                          //      //    //var pageFolder = path.join(folder, 'pages');
                          //      //    //
                          //      //    //var fileDesPath = path.join(rootPath, document.projectFile.filePath);
                          //      //    //var fileDesFolder = path.join(rootPath, document.projectFile.filePath.substring(0, document.projectFile.filePath.lastIndexOf('/')));
                          //      //    //var destinationFolder = path.join(fileDesFolder, utilService.getFolderNameFromFile(path.basename(fileDesPath)));
                          //      //    //var destPageFolder = path.join(destinationFolder, 'pages');
                          //      //    //
                          //      //    //if(!fs.existsSync(destinationFolder)) {
                          //      //    //  fs.mkdirSync(destinationFolder);
                          //      //    //}
                          //      //    //
                          //      //    //if(!fs.existsSync(destPageFolder)) {
                          //      //    //  fs.mkdirSync(destPageFolder);
                          //      //    //}
                          //      //    //
                          //      //    //var oldImage = fs.readdirSync(destPageFolder);
                          //      //    //_.each(oldImage, function(el) {
                          //      //    //  fs.unlinkSync(path.join(destPageFolder, el));
                          //      //    //});
                          //      //    //
                          //      //    //var images = fs.readdirSync(pageFolder);
                          //      //    //_.each(images, function(el) {
                          //      //    //  fse.copySync(pageFolder, destPageFolder);
                          //      //    //});
                          //      //  });
                          //    }
                          //  });
                          //}, function(err) {
                          //  console.log('Failed to parse pdf to images', err.message);
                          //});
                        }
                      });
                    }
                    else {
                      var tempFile = fs.readdirSync(outputFolder)[0];
                      if(tempFile) {
                        var tempFilePath = path.join(outputFolder, tempFile);
                        var filePath = path.join(rootPath, document.projectFile.filePath);
                        var fileFolder = path.join(rootPath, string.path(document.projectFile.filePath).baseDir);
                        //var folder = path.join(fileFolder, utilService.getFolderNameFromFile(path.basename(filePath)));
                        var fileExt = path.extname(filePath);
                        var fileName = path.basename(filePath, fileExt);
                        var thumbnail = path.join(fileFolder, fileName + '.thumb.jpg');
                        fse.copySync(tempFilePath, filePath);
                        res.send({
                          success: true,
                          filePath: document.projectFile.filePath
                        });
                        //imageService.cropImageSquare(filePath, thumbnail, 200, function(err) {
                        //  if(!err) {
                        //    //updateConversionProgress(document.projectFile.fileId, baseRequest);
                        //  } else {
                        //    failure(err.message);
                        //  }
                        //});
                      } else {
                        failure('Cannot export the file!');
                      }
                    }
                  }
                });
            });
          });
      };

      if(fs.existsSync(path.join(rootPath, document.projectFile.filePath))) {
        console.log('File already exported, proceed to download');
        res.send({
          success: true,
          filePath: document.projectFile.filePath
        });
      }
      else {
        if(document.projectFile.parentProjectFileId !== 0) {
          console.log('Get parent document...');
          documentService.getDocumentById(document.projectFile.parentProjectFileId, projectId, baseRequest)
            .then(function(parentDocument) {
              console.log('Get parent document...Done');
              console.log('Exporting document to pdf/image...');
              exportFile(document, parentDocument.projectFile.filePath);
            });
        }
        else {
          console.log('Exporting document to pdf/image...');
          exportFile(document, document.projectFile.filePath);
        }
      }
    });
}

module.exports = {
  //exportPdf: exportPdf,
  exportPdf2: exportPdf2,
  getNextVersionName: getNextVersionName,
  getPages: getPages,
  getZoomLevel: getZoomLevel,
  checkFileStatus: checkFileStatus,
  generateThumbnail: generateThumbnail,
  downloadFile: downloadFile
};