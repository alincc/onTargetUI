define(function(require) {
  'use strict';
  var angular = require('angular'),
    template = require('text!./templates/projectChooser.html'),
    notificationsService = require('app/common/services/notifications'),
    projectContextModule = require('app/common/context/project'),
    module;
  module = angular.module('common.directives.projectChooser', ['common.services.notifications', 'common.context.project']);
  module.run(['$templateCache', function($templateCache) {
    $templateCache.put('projectChooserTemplate', template);
  }]);
  module.directive('projectChooser', ['$rootScope', 'notifications', 'projectContext', function($rootScope, notifications, projectContext) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'projectChooserTemplate',
      controller: ['$scope', function($scope) {
        $scope.projects = $rootScope.mainProjectInfo.projects;
        $scope.currentProject = $rootScope.currentProjectInfo;
        $scope.selectProject = function(pj) {
          if(pj.projectId !== $scope.currentProject.projectId) {
            projectContext.setProject(pj);
            notifications.currentProjectChange({project: pj});
          }
        };
        $scope.status = {
          isopen: false
        };
        $scope.toggleDropdown = function() {
          $scope.status.isopen = !$scope.status.isopen;
        };
      }],
      link: function(scope, elem, attrs) {
        elem.parent().children('[toggle-project-chooser]').on('click', function(e) {
          scope.$apply(scope.toggleDropdown);
        });

        scope.$on('$destroy', function() {
          elem.parent().children('[toggle-project-chooser]').off('click');
        });
      }
    };
  }]);
  return module;
});