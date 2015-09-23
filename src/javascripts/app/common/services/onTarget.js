/**
 * Created by aashiskhanal on 9/2/15.
 */

define(function(require) {
    'use strict';
    var angular = require('angular'),
        module;

    module = angular.module('common.services.onTarget', ['app.config']);

    module.factory('onTargetFactory',
        ['appConstant', '$http',
            function(constant, $http) {
                var service = {};

                return service;
            }
        ]
    );
});
