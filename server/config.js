var path = require('path');
var rootPath = process.env.ROOT;
var assetsPath = path.join(rootPath, 'assets');

module.exports = {
  PROXY_URL: 'http://app.ontargetcloud.com:8080/ontargetrs/services',
  fileInputName: "file",
  downloadPathHashKey:'onTargetDPHK',
  assetsPath: assetsPath,
  uploadedFilesPath: assetsPath + '/',
  imagePathRoot: 'assets/',
  maxFileSize: 5000000,
  externalStorage: {
    googleDrive: {}
  }
};