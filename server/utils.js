'use strict';
var mime = require('mime');
String.prototype.startsWith = function(prefix) {
  return this.indexOf(prefix) === 0;
};

String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

GLOBAL.string = {
  join: function(separator) {
    var args = Array.prototype.slice.call(arguments, 1); // except first argument
    return args.join(separator);
  },
  path: function(path){
    return {
      extension: path.substring(path.lastIndexOf('.') + 1),
      name: path.substring(path.lastIndexOf('/') + 1),
      nameOnly: path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.')),
      mimeType: mime.lookup(path.substring(path.lastIndexOf('.') + 1)),
      baseDir: path.substring(0, path.lastIndexOf('/'))
    }
  }
};