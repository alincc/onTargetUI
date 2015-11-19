var path = require('path');
var fs = require("fs");
var request = require('request');
var rootPath = process.env.ROOT;
var mime = require('mime');
var gm = require('gm');
var exec = require('child_process').exec;
var pdfService = require('./../services/pdf');
var imageService = require('./../services/image');
var utilService = require('./../services/util');
var config = require('./../config');
var Promise = require('promise');
var _ = require('lodash');

function getFileInfo(req, res) {
  var relativePath = req.body.path;
  var filePath = path.join(rootPath, relativePath);
  var fileExt = relativePath.substring(relativePath.lastIndexOf('.') + 1);
  var fileType = mime.lookup(fileExt);

  if(!fs.existsSync(filePath)) {
    res.status(400);
    res.send('File not found!');
  } else {
    if(/(png|jpg|jpeg|bmp)/i.test(fileExt)) {
      gm(filePath).size(function(err, value) {
        if(err) {
          res.status(400);
          res.send(err);
        } else {
          var imgWidth = value.width;
          var imgHeight = value.height;

          var stats = fs.statSync(filePath);
          var fileSizeInBytes = stats["size"];

          res.send({
            success: true,
            type: fileType,
            width: imgWidth,
            height: imgHeight,
            url: relativePath,
            size: fileSizeInBytes
          });
        }
      });
    } else {
      res.status(400);
      res.send('File type not found for ' + fileExt);
    }
  }
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

function convertPdfToImage(req, res) {
  var relativePath = req.body.path;
  var docId = req.body.docId;
  var baseRequest = req.body.baseRequest;
  var filePath = path.join(rootPath, relativePath);
  var fileFolder = path.join(rootPath, relativePath.substring(0, relativePath.lastIndexOf('/')));
  var fileExt = path.extname(filePath);
  var fileName = path.basename(filePath, fileExt);
  var outputFolder = path.dirname(filePath);
  var triedTime = 0;
  var destinationFolder = path.join(outputFolder, 'output');
  console.log('Starting convert pdf to images progress...');
  if(/\.pdf$/.test(relativePath)) {
    console.log('Parsing pdf to images...');
    pdfService.parse(relativePath).then(function() {
      console.log('Parsing pdf to images...Done!');
      console.log('Starting images splicing...');
      console.time('ImagesSplicing');
      var promises = [];
      var folder = fs.readdirSync(path.join(fileFolder, utilService.getFolderNameFromFile(path.basename(filePath)), 'pages'));
      _.each(folder, function(el) {
        var fp = path.join(fileFolder, utilService.getFolderNameFromFile(path.basename(filePath)), 'pages', el);
        if(fs.lstatSync(fp).isFile()) {
          for(var size = 0; size < 5; size++) {
            promises.push(imageService.tiles(fp, 512 * Math.pow(2, size), size));
          }
        }
      });

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
    console.log('Making thumbnail...');
    var thumbnail = path.join(fileFolder, fileName + '.thumb.jpg');
    imageService.cropImageSquare(filePath, thumbnail, 200, function(err) {
      console.log('Making thumbnail...Done!');
      res.send({
        success: true
      });
    });
  }
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
  var relativeExportedFilePath = relativePath.substring(0, relativePath.lastIndexOf('/')) + '/converted_' + fileName + '.jpg';

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