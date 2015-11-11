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
  newGuidId: function () {
    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};