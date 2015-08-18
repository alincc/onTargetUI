/**
 * Created by thophan on 8/17/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', '$modal', 'userContext', 'projectFactory', 'companies', 'activityFactory', '$modalInstance', 'toaster', 'projectContext', function ($scope, $rootScope, $modal, userContext, projectFactory, companies, activityFactory, $modalInstance, toaster, projectContext){
    console.log($scope.currentProject);
    $scope.currentProject = $rootScope.currentProjectInfo;

    $scope.project = {
      projectParentId: $scope.currentProject.projectId,
      projectTypeId: $scope.currentProject.projectTypeId,
      projectName: "",
      projectDescription: "",
      companyId: "",
      startDate: "",
      endDate: "",
      status: ""
    };

    $scope.model = {
      userId: userContext.authentication().userData.userId,
      project: $scope.project
    };

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
      $scope.onSubmit = true;
      activityFactory.addActivity($scope.model).then(
        function (resp){
          $scope.onSubmit = false;
          /*$scope.currentProject.projects.push($scope.project);
          projectContext.setProject($scope.currentProject, null);*/
          toaster.pop('success', 'Success', resp.data.returnMessage);
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
