define(function (require) {
  'use strict';

  var angular = require('angular');

  var module = angular.module('common.directives.validFile', [])
    .directive('validFile', function () {
      return {
        require: 'ngModel',
        link: function (scope, el, attrs, ngModel) {

          function validate() {
            scope.$apply(function () {
              ngModel.$setViewValue(el.val());
            });
          }

          //change event is fired when file is selected
          el.bind('change', validate);
        }
      };
    });

  return module;

});
