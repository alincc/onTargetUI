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
  maxFileSize: 5000000,
  externalStorage: {
    googleDrive: {}
  },
  pusher_appId: '152503',
  pusher_key: 'f0a0bf34cd094e438cba',
  pusher_secret: 'a2244d813cebbd30dc2e',
  convertCommand: 'convert',
  gsCommand: 'gs',
  concurrencyImageProcesses: 5
};