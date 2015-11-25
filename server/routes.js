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
var fileController = require('./controllers/file');
var onSiteController = require('./controllers/onSite');

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
  app.post('/node/file/info', fileController.fileInfo);
  app.post('/node/file/getPdfImage', fileController.pdfImage);
  app.post('/node/file/convertPdfToImage', fileController.convertPdfToImage);
  app.post('/node/onsite/exportPdf', onSiteController.exportPdf2);
  app.post('/node/onsite/getNextVersionName', onSiteController.getNextVersionName);
  app.post('/node/onsite/getPdfImages', onSiteController.getPdfImages);
  app.post('/node/onsite/getZoomLevel', onSiteController.getZoomLevel);
  app.post('/node/onsite/checkFileStatus', onSiteController.checkFileStatus);
  app.post('/node/onsite/generateThumbnail', onSiteController.generateThumbnail);
  app.post('/node/onsite/downloadFile', onSiteController.downloadFile);
};