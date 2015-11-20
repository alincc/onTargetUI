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
var pdfService = require('./../services/pdf');
var utilService = require('./../services/util');
var imageService = require('./../services/image');
var documentService = require('./../services/document');
var Promise = require('promise');

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
      var promises = [], error, outputFolder = path.join(rootPath, 'assets', 'temp', utilService.newGuidId());

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
                /*Math.log(imgWidth / 512) / Math.log(2)*/
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
          if(error) {
            console.log('Starting export image with markups, tags to pdf...Failed!');
            console.log(error.message);
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
                var fileFolder = path.join(rootPath, document.projectFile.filePath.substring(0, document.projectFile.filePath.lastIndexOf('/')));
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
  var filePath = req.body.path;
  var fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
  var fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  var fileExt = fileName.substring(fileName.lastIndexOf('.') + 1);
  var fullFilePath = [rootPath, filePath].join('/');
  var versionName = filePath.substring(0, filePath.lastIndexOf('/'));
  var reg = new RegExp(fileNameWithoutExt + '\\-\\d+\\.' + fileExt + '$');
  if(fs.existsSync(fullFilePath)) {
    var files = fs.readdirSync(path.join(fullFilePath.substring(0, fullFilePath.lastIndexOf('/'))));
    var versions = _.filter(files, function(file) {
      return reg.test(file);
    });
    if(versions.length <= 0) {
      versionName = versionName + '/' + fileNameWithoutExt + '-1.' + fileExt;
    } else {
      var lastVersionName = _.sortBy(versions).reverse()[0];
      var versionNumber = /.*\-(\d+)\./.exec(lastVersionName)[1];
      lastVersionName = lastVersionName.substring(0, lastVersionName.lastIndexOf('-'));
      if(versionNumber) {
        versionName = versionName + '/' + lastVersionName + '-' + (parseInt(versionNumber) + 1) + '.' + fileExt;
      }
    }

    res.send({
      success: true,
      newVersionName: versionName
    });
  } else {
    res.status(400);
    res.send('File not found!');
  }
}

function getPdfImages(req, res) {
  var relativePath = req.body.path;
  var filePath = path.join(rootPath, relativePath);
  var fileFolder = path.join(rootPath, relativePath.substring(0, relativePath.lastIndexOf('/')));
  var fileExt = path.extname(filePath);
  var fileName = path.basename(filePath);
  var fileNameWithoutExt = path.basename(filePath, fileExt);
  var folder = path.join(fileFolder, utilService.getFolderNameFromFile(fileName));
  var pageFolder = path.join(folder, 'pages');
  var destinationFilePath = path.join(folder, 'pages', fileNameWithoutExt + '.jpg');
  var sendResult = function(pages) {
    res.send({
      success: true,
      pages: pages
    });
  };
  var makePath = function(name) {
    return relativePath.substring(0, relativePath.lastIndexOf('/')) + '/' + utilService.getFolderNameFromFile(fileName) + '/pages/' + name;
  };

  if(!fs.existsSync(folder)) {
    sendResult([]);
    return;
  }

  if(!fs.existsSync(pageFolder)) {
    sendResult([]);
    return;
  }

  var files = _.filter(fs.readdirSync(pageFolder), function(fileName) {
    return fs.lstatSync(path.join(pageFolder, fileName)).isFile();
  });
  if(files.length === 1) {
    sendResult([makePath(files[0])]);
  }
  else if(files.length > 1) {
    var pages = [];
    _.each(files, function(el) {
      pages.push(makePath(el));
    });
    sendResult(pages);
  }
  else {
    sendResult([]);
  }
}

function getZoomLevel(req, res) {
  var relativePath = req.body.path;
  var filePath = path.join(rootPath, relativePath);
  var fileFolder = path.join(rootPath, relativePath.substring(0, relativePath.lastIndexOf('/')));
  var fileExt = path.extname(filePath);
  var fileName = path.basename(filePath);
  var fileNameWithoutExt = path.basename(filePath, fileExt);
  var folder = path.join(fileFolder, utilService.getFolderNameFromFile(fileName));
  var pageFolder = path.join(folder, 'pages');
  var results = [];
  var pageNumber = 1;
  var zoomLevel = 0;
  var pages = fs.readdirSync(pageFolder);
  _.each(pages, function(el) {
    var fp = path.join(pageFolder, el);
    if(fs.lstatSync(fp).isDirectory()) {
      var zoomFolders = fs.readdirSync(fp);
      _.each(zoomFolders, function(el, idx) {
        if(fs.existsSync(path.join(fp, el, 'loaded.txt'))) {
          results.push({
            page: pageNumber++,
            zoomLevel: idx + 1
          });
        }
        else {
          return false;
        }
      });
    }
  });
  res.send(results);
}

module.exports = {
  //exportPdf: exportPdf,
  exportPdf2: exportPdf2,
  getNextVersionName: getNextVersionName,
  getPdfImages: getPdfImages,
  getZoomLevel: getZoomLevel
};