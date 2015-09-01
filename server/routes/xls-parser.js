var express = require('express');
var path = require('path');
var fs = require("fs");
var mkdirp = require("mkdirp");
var rimraf = require("rimraf");
var rootPath = process.env.ROOT;
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var excelParser = require('excel-parser');
var moment = require('moment');
//var cors = require('cors');
// paths/constants
var fileInputName = "file",
  assetsPath = path.join(rootPath, 'assets'),
  uploadedFilesPath = assetsPath + "/temp/",
  imagePathRoot = 'assets/temp/',
  maxFileSize = 10000000; // in bytes

function uploadFile(req, res) {
  var file = req.files[fileInputName],
    uuid = req.body.uuid,
    responseData = {
      success: false
    };

  file.name = req.body.fileName;

  if(isValid(file.size)) {
    moveUploadedFile(file, uuid, function() {
        responseData.success = true;
        responseData.url = imagePathRoot + uuid + "/" + file.name;
        responseData.name = file.name;
        responseData.type = file.type;
        responseData.size = file.size;
        var fileUrl = path.join(rootPath, responseData.url);

        excelParser.parse({
          inFile: fileUrl,
          worksheet: 1,
          skipEmpty: true//,
          //searchFor: {
          //  term: ['my serach term'],
          //  type: 'loose'
          //}
        }, function(err, records) {
          if(err) {
            res.send({
              success: false,
              error: err
            });
          }
          else {
            responseData.records = records;
            for(var i = 0; i < responseData.records.length; i++) {
              var el = responseData.records[i];
              // activity start date
              //if(/^\d{1,2}\-\d{1,2}\-\d{2}$/.test(el[2])) {
              //  el[2] = moment(el[2], 'DD-MM-YYYY').format('DD/MM/YYYY');
              //}
              //else if(/^\d{1,2}\-\d{1,2}\-\d{4}$/.test(el[2])) {
              //  el[2] = moment(el[2], 'DD-MM-YY').format('DD/MM/YYYY');
              //}
              //// activity end date
              //if(/^\d{1,2}\-\d{1,2}\-\d{2}$/.test(el[3])) {
              //  el[3] = moment(el[3], 'DD-MM-YYYY').format('DD/MM/YYYY');
              //}
              //else if(/^\d{1,2}\-\d{1,2}\-\d{4}$/.test(el[3])) {
              //  el[3] = moment(el[3], 'DD-MM-YY').format('DD/MM/YYYY');
              //}
              //// task start date
              //if(/^\d{1,2}\-\d{1,2}\-\d{2}$/.test(el[6])) {
              //  el[6] = moment(el[6], 'DD-MM-YYYY').format('DD/MM/YYYY');
              //}
              //else if(/^\d{1,2}\-\d{1,2}\-\d{4}$/.test(el[6])) {
              //  el[6] = moment(el[6], 'DD-MM-YY').format('DD/MM/YYYY');
              //}
              //// task end date
              //if(/^\d{1,2}\-\d{1,2}\-\d{2}$/.test(el[7])) {
              //  el[7] = moment(el[7], 'DD-MM-YYYY').format('DD/MM/YYYY');
              //}
              //else if(/^\d{1,2}\-\d{1,2}\-\d{4}$/.test(el[7])) {
              //  el[7] = moment(el[7], 'DD-MM-YY').format('DD/MM/YYYY');
              //}
            }
            res.send(responseData);
          }
        });
      },
      function() {
        responseData.error = "Problem copying the file!";
        res.send(responseData);
      });
  }
  else {
    failWithTooBigFile(responseData, res);
  }
}

function failWithTooBigFile(responseData, res) {
  responseData.error = "Too big!";
  responseData.preventRetry = true;
  res.send(responseData);
}

function isValid(size) {
  return size < maxFileSize;
}

function moveFile(destinationDir, sourceFile, destinationFile, success, failure) {
  mkdirp(destinationDir, function(error) {
    var sourceStream, destStream;

    if(error) {
      console.error("Problem creating directory " + destinationDir + ": " + error);
      failure();
    }
    else {
      sourceStream = fs.createReadStream(sourceFile);
      destStream = fs.createWriteStream(destinationFile);

      sourceStream
        .on("error", function(error) {
          console.error("Problem copying file: " + error.stack);
          failure();
        })
        .on("end", success)
        .pipe(destStream);
    }
  });
}

function moveUploadedFile(file, uuid, success, failure) {
  var destinationDir = uploadedFilesPath + uuid + "/",
    fileDestination = destinationDir + file.name;

  moveFile(destinationDir, file.path, fileDestination, success, failure);
}

module.exports = function(app) {
  app.post('/node/xls-parser', [multipartMiddleware], uploadFile);
};