var path = require('path');
var fs = require("fs");
var rootPath = process.env.ROOT;
var mime = require('mime');
var config = require('./../config');
var CryptoJS = require("crypto-js");
var key = config.downloadPathHashKey;
var cfg = {};

//var ciphertext = CryptoJS.AES.encrypt('assets%2Fprojects%2FTBAeXqI4822DWZ4fQFcI%2Fonsite%2FPdf%20Export-%20Transmittal.docx.pdf', key, cfg);
//console.log(ciphertext.toString());
//// U2FsdGVkX1+ulnTjoQr0Wqo68SE1KSdyHIAH2OPd6ZJBhLsPksHOgljXC0FXhCYSBwllaee3pBq1Gsegi6ENCvNtMOldy9VRFDsdwC5zvPpmipM1TrAbBYClwkl0CZ+ZDGaVKNCzyQkMvOCwAcWtCg==
//// U2FsdGVkX1 ulnTjoQr0Wqo68SE1KSdyHIAH2OPd6ZJBhLsPksHOgljXC0FXhCYSBwllaee3pBq1Gsegi6ENCvNtMOldy9VRFDsdwC5zvPpmipM1TrAbBYClwkl0CZ ZDGaVKNCzyQkMvOCwAcWtCg==
//var plaintext = CryptoJS.AES.decrypt(ciphertext.toString(), key, cfg);
//console.log(plaintext.toString(CryptoJS.enc.Utf8));

function downloadFile(req, res) {
  var url = req.query.url;
  if(req.query.id) {
    var id = req.query.id;
    id = id.replace(/\s/g, '+');
    url = CryptoJS.AES.decrypt(id, key, cfg).toString(CryptoJS.enc.Utf8);
    url = decodeURIComponent(url);
    if(/^\?/.test(url)) {
      url = url.substring(1, url.length);
    }
  }

  var file = rootPath + '/' + url,
    fileName = req.query.name ? decodeURIComponent(req.query.name) : path.basename(file);

  if(fs.existsSync(file)) {
    res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
    res.setHeader('Content-type', mime.lookup(fileName.substring(fileName.lastIndexOf('.') + 1)));

    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
  }
  else {
    res.status(404)        // HTTP status 404: NotFound
      .send('File not found');
  }
}

module.exports = {
  downloadFile: downloadFile
};