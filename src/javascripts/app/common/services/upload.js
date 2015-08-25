/**
 * Created by thophan on 8/11/2015.
 */
/* jslint plusplus: true */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    utilService = require('app/common/services/util'),
    module,
    fileupload = require('ngFileUpload');

  module = angular.module('common.services.upload', ['app.config', 'ngFileUpload', 'common.services.util']);

  module.factory('uploadFactory',
    ['Upload', 'appConstant', 'utilFactory',
      function(Upload, constant, utilFactory) {
        var service = {};
        service.upload = function(file, context, newFileName) {
          newFileName = newFileName || file.name;
          return Upload.upload({
            url: constant.resourceUrl + '/assets/upload',
            //url: constant.nodeServer + '/node/upload',
            file: file,
            //data: {context: context},
            fields: {'context': context, 'uuid': utilFactory.newGuid(), 'fileName': newFileName },
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
