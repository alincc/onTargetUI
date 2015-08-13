/**
 * Created by thophan on 8/11/2015.
 */
/* jslint plusplus: true */
define(function(require) {
    'use strict';
    var angular = require('angular'),
        module,
        fileupload = require('ngFileUpload');

    module = angular.module('common.services.upload', ['app.config', 'ngFileUpload']);

    module.factory('uploadFile',
        ['Upload', 'appConstant',
            function(Upload, constant) {
                var service = {};
                service.upload = function(file) {
                    return Upload.upload({
                        url: constant.resourceUrl + '/assets/upload',
                        file: file
                    });
                };

                return service;
            }
        ]
    );
});
