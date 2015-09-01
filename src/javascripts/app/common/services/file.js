define(function(require) {
  'use strict';
  var angular = require('angular'),
    utilService = require('app/common/services/util'),
    module,
    fileupload = require('ngFileUpload');

  module = angular.module('common.services.file', ['app.config', 'ngFileUpload', 'common.services.util']);

  module.factory('fileFactory',
    ['Upload', 'appConstant', 'utilFactory', '$http',
      function(Upload, constant, utilFactory, $http) {
        var service = {};

        service.upload = function(file, newFileName, rootFolder, projectId, context) {
          newFileName = newFileName || file.name;
          return Upload.upload({
            url: constant.nodeServer + '/node/upload',
            file: file,
            fields: {
              'uuid': utilFactory.newGuid(),
              'fileName': newFileName,
              'folder': rootFolder,
              'projectId': projectId,
              context: context || ''
            },
            headers: {
              'Authorization': false
            }
          });
        };

        service.move = function(filePath, newFileName, rootFolder, projectId, context) {
          newFileName = newFileName || filePath.substring(filePath.lastIndexOf('/') + 1);
          return $http.post(constant.nodeServer + '/node/move', {
            'path': filePath,
            'uuid': utilFactory.newGuid(),
            'fileName': newFileName,
            'folder': rootFolder,
            'projectId': projectId,
            context: context || ''
          }, {
            headers: {
              'Authorization': false
            }
          });
        };
        return service;
      }
    ]
  );
});
