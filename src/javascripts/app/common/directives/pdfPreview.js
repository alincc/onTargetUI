/**
 * Created by aashiskhanal on 10/19/15.
 */

define(function(require) {
    'use strict';
    var angular = require('angular'),
        config = require('app/config');
    var module = angular.module('common.directives.pdfPreview', ['app.config']);

    module.directive('pdf', function() {
        return {
            restrict: 'E',
            link: function(scope, element, attrs) {
                var url = scope.$eval(attrs.src);
                element.replaceWith('<object width="100%" height="100%" type="application/pdf" data="' + url + '"></object>');
            }
        };
    });


    return module;
});

