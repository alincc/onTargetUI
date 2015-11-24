var path = require('path');
var rootPath = process.env.ROOT;
var assetsPath = path.join(rootPath, 'assets');

module.exports = {
  PROXY_URL: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
  fileInputName: "file",
  downloadPathHashKey: 'onTargetDPHK',
  assetsPath: assetsPath,
  uploadedFilesPath: assetsPath + '/',
  imagePathRoot: 'assets/',
  maxFileSize: 25000000,
  externalStorage: {
    googleDrive: {}
  },
  pusher_appId: '138273',
  pusher_key: 'c2f5de73a4caa3763726',
  pusher_secret: 'e2455e810e36cbed510e',
  convertCommand: 'convert',
  gsCommand: 'gswin64c',
  concurrencyImageProcesses: 1
};