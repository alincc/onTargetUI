/**
 * Created by thophan on 8/17/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', '$modal', 'userContext', 'projectFactory', 'companies', 'activityFactory', '$modalInstance', 'toaster', 'activity', function ($scope, $rootScope, $modal, userContext, projectFactory, companies, activityFactory, $modalInstance, toaster, activity){

    $scope.currentProject = $rootScope.currentProjectInfo;
    console.log($scope.currentProject);
    $scope.project = {
      projectParentId: activity.projectParentId,
      projectTypeId: activity.projectTypeId,
      projectId: activity.projectId,
      projectName: activity.projectName,
      projectDescription: activity.projectDescription,
      companyId: activity.companyId,
      startDate: activity.startDate,
      endDate: activity.endDate,
      status: activity.status
    };

    $scope.model = {
      userId: userContext.authentication().userData.userId,
      project: $scope.project
    };

    $scope.minDate2 = $scope.currentProject.startDate;
    $scope.maxDate2 = $scope.currentProject.endDate;
    $scope.$watchCollection('[project.startDate, project.endDate]', function(e){
      $scope.minDate = $scope.project.startDate ? $scope.project.startDate : $scope.currentProject.startDate;
      $scope.maxDate = $scope.project.endDate ? $scope.project.endDate : $scope.currentProject.endDate;
    });

    $scope.projectStatuses = projectFactory.getProjectStatuses();
    $scope.companies = companies;

    $scope.startDate = {
      options: {
        formatYear: 'yyyy',
        startingDay: 1
      },
      isOpen: false,
      open: function ($event){
        this.isOpen = true;
      }
    };

    $scope.endDate = {
      options: {
        formatYear: 'yyyy',
        startingDay: 1
      },
      isOpen: false,
      open: function ($event){
        this.isOpen = true;
      }
    };

    $scope.onSubmit = false;

    $scope.save = function (){
      console.log($scope.model);
      $scope.onSubmit = true;
      activityFactory.addActivity($scope.model).then(
        function (resp){
          $scope.onSubmit = false;
          $scope.form.$setPristine();
          $modalInstance.close({});
        }, function (err){
          $scope.onSubmit = false;
          $scope.form.$setPristine();
        }
      );
    };
    $scope.cancel = function (){
      $modalInstance.dismiss('cancel');
    };
  }];
  return controller;
});
