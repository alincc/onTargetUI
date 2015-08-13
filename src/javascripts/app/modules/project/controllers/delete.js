/**
 * Created by thophan on 8/13/2015.
 */
/**
 * Created by thophan on 8/12/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'countryFactory', 'projectFactory', 'project', 'userContext', 'projectContext',
    function ($scope, $rootScope, $modalInstance, countryFactory, projectFactory, project, userContext, projectContext){

      $scope.delete = function (){
        projectFactory.deleteProject({
          projectId: project.projectId
        }).then(
          function (resp){
            $modalInstance.close({});
          }
        );
      };

      $scope.cancel = function (){
        $modalInstance.dismiss('cancel');
      };
    }];
  return controller;
});