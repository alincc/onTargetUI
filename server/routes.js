var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var onFileController = require('./controllers/onFile');
var uploadController = require('./controllers/upload');
var downloadController = require('./controllers/download');
var downloadFileController = require('./controllers/downloadFile');
var xlsParserController = require('./controllers/xlsParser');
var moveController = require('./controllers/move');
var googleDriveController = require('./controllers/googleDrive');
var boxController = require('./controllers/box');
var dropBoxController = require('./controllers/dropBox');

module.exports = function(app) {
  app.post('/node/onfile/export', onFileController.exportPdf);
  app.post('/node/upload', [multipartMiddleware], uploadController.upload);
  app.post('/node/download', downloadController.download);
  app.get('/download/file', downloadFileController.downloadFile);
  app.post('/node/xls-parser', [multipartMiddleware], xlsParserController.xlsParser);
  app.post('/node/move', moveController.move);
  app.get('/node/files/googledrive', googleDriveController.googleDrive);
  app.get('/node/files/box', boxController.box);
  app.get('/node/files/dropbox', dropBoxController.dropBox);
};