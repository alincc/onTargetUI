var path = require('path');
var rootPath = GLOBAL.ROOTPATH;
var assetFolderName = 'assets';

module.exports = {
  PROXY_URL: 'http://int.api.ontargetcloud.com:8080/ontargetrs/services',
  fileInputName: "file",
  downloadPathHashKey: 'onTargetDPHK',
  imagePathRoot: assetFolderName,
  assetsPath: path.join(rootPath, assetFolderName),
  maxFileSize: 25000000,
  pusher_appId: '138273',
  pusher_key: 'c2f5de73a4caa3763726',
  pusher_secret: 'e2455e810e36cbed510e',
  convertCommand: 'convert',
  gsCommand: 'gswin64c',
  concurrencyImageProcesses: 1,
  domain: 'http://localhost:9001',
  resource_domain: 'https://ontarget-assets-test.s3.amazonaws.com',
  aws_s3_profile: 'default',
  aws_s3_bucket: 'ontarget-assets-test'
};