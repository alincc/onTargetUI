var config = require('./../config');
var CryptoJS = require("crypto-js");
var fs = require('fs');
var rootPath = GLOBAL.ROOTPATH;
var path = require('path');

module.exports = {
  makeId: function(l) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < l; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },
  getFolderNameFromFile: function(fileName) {
    return fileName.replace(/(\.)/g, '_');
  },
  newGuidId: function() {
    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  hash: function(str) {
    return CryptoJS.AES.encrypt(str, config.downloadPathHashKey, {}).toString();
  },
  generateAssetPath: function(rootFolder, projectAssetFolderName, context, fn, uuid) {
    var url = string.join('/', config.imagePathRoot, rootFolder + '/'); // assets/<root>
    this.ensureFolderExist(path.join(rootPath, config.imagePathRoot, rootFolder));
    if(rootFolder === 'projects') {
      this.ensureFolderExist(path.join(rootPath, config.imagePathRoot, rootFolder, projectAssetFolderName));
      if(context === '') {
        url += string.join('/', projectAssetFolderName, fn); // assets/projects/<projectassetsname>/<filename>
      }
      else {
        this.ensureFolderExist(path.join(rootPath, config.imagePathRoot, rootFolder, projectAssetFolderName, context));
        url += string.join('/', projectAssetFolderName, context, fn); // assets/projects/<projectassetsname>/<context>/<filename>
      }
    }
    else if(rootFolder === 'temp') {
      this.ensureFolderExist(path.join(rootPath, config.imagePathRoot, rootFolder, uuid));
      url += string.join('/', uuid, fn);
    }
    else {
      url += fn; // assets/<root>/<filename>
    }
    return url;
  },
  ensureFolderExist: function(dirPath) {
    if(!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  }
};