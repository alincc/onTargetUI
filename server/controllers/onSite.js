var path = require('path');
var fs = require("fs");
var request = require('request');
var mime = require('mime');
var gm = require('gm');
var _ = require('lodash');
var rootPath = process.env.ROOT;
var config = require('./../config');
var pdfService = require('./../services/pdf');
var utilService = require('./../services/util');

function exportPdf(req, res) {
  var imageUrl = req.body.path;
  var docId = req.body.docId;
  var baseRequest = req.body.baseRequest;
  var markerUrl = 'server/assets/img/marker-icon.png';
  var listGeo = req.body.geo;
  var zoom = req.body.scale;
  var exportFileName = req.body.fileName;
  var imgWidth, imgHeight;
  var projectAssetFolderName = req.body.projectAssetFolderName;

  var convertPdfToImage = function() {
    // Convert pdf to image
    pdfService.parse('assets/projects/' + projectAssetFolderName + '/onsite/' + exportFileName, function() {
      console.log('Update document conversation complete: ' + JSON.stringify({
          "projectFileId": docId,
          isConversionComplete: true,
          "baseRequest": baseRequest
        }));
      request({
        method: 'POST',
        body: {"projectFileId": docId, isConversionComplete: true, "baseRequest": baseRequest},
        json: true,
        url: config.PROXY_URL + '/upload/updateConversionComplete'
      });
    });
  };

  var g = gm(path.join(rootPath, imageUrl)).size(function(err, size) {
    var randomId = utilService.newGuidId();
    if(!err) {
      imgWidth = size.width;
      imgHeight = size.height;
      var scale = Math.pow(2, zoom);

      function getOpacityStr(opt) {
        return ('0' + Math.round((1 - opt) * 255).toString(16)).slice(-2);
      }

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
              d[1] = -d[1];
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
              d[1] = -d[1];
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
            coords[1] = -coords[1];
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

      var destinationPath1 = path.join(rootPath, 'assets', 'temp', randomId);
      if(!fs.existsSync(destinationPath1)) {
        fs.mkdirSync(destinationPath1);
      }
      var tmpName = 'tmp_' + randomId + '.jpg';
      tmpName = path.join(destinationPath1, tmpName);

      var destinationPath = path.join(rootPath, 'assets', 'projects', projectAssetFolderName);

      if(!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath);
      }
      destinationPath = path.join(destinationPath, 'onsite');

      if(!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath);
      }
      destinationPath = path.join(destinationPath, exportFileName);

      //var returningPath = 'assets/projects/' + projectAssetFolderName + '/onsite/' + exportFileName;

      g.write(tmpName, function() {
        var newG = gm()
          .in('-page', '+0+0')
          .in(tmpName);
        for(var i = 0; i < listGeo.length; i++) {
          var type = listGeo[i].geometry.type;
          var coords = listGeo[i].geometry.coordinates;
          if(listGeo[i].type === 'marker') {
            newG = newG.in('-page', '+' + coords[0] + '+' + coords[1])
              .in(markerUrl);
          }
        }

        newG.mosaic()  // Merges the images as a matrix
          .write(tmpName, function(err) {
            gm(tmpName).write(destinationPath, function() {
              convertPdfToImage();
            });
          });
      });
    }
  });

  res.send({
    success: true
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
    var files = fs.readdirSync(fullFilePath.substring(0, fullFilePath.lastIndexOf('/')));
    var versions = _.filter(files, function(file) {
      return reg.test(file);
    });
    if(versions.length <= 0) {
      versionName = versionName + '/' + fileNameWithoutExt + '-1.' + fileExt;
    } else {
      var lastVersionName = _.sortBy(versions).reverse()[0];
      var versionNumber = /.*\-(\d+)\./.exec(lastVersionName)[1];
      if(versionNumber) {
        versionName = versionName + '/' + fileNameWithoutExt + '-' + (parseInt(versionNumber) + 1) + '.' + fileExt;
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
  }

  if(!fs.existsSync(pageFolder)) {
    sendResult([]);
  }

  var files = fs.readdirSync(pageFolder);
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

module.exports = {
  exportPdf: exportPdf,
  getNextVersionName: getNextVersionName,
  getPdfImages: getPdfImages
};