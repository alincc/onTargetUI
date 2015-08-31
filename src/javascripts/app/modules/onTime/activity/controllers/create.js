/**
 * Created by thophan on 8/17/2015.
 */
define(function (require){
  'use strict';
  var moment = require('moment');
  var controller = ['$scope', '$rootScope', '$modal', 'userContext', 'projectFactory', 'companies', 'activityFactory', '$modalInstance', 'toaster', 'projectContext', '$filter', function ($scope, $rootScope, $modal, userContext, projectFactory, companies, activityFactory, $modalInstance, toaster, projectContext, $filter){
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


    $scope.minDate2 = $scope.currentProject.startDate;
    $scope.maxDate2 = $scope.currentProject.endDate;
    $scope.initStartDate = new Date($scope.minDate2);
      $scope.$watchCollection('[project.startDate, project.endDate]', function(e){
      $scope.minDate = $scope.project.startDate ? $scope.project.startDate : $scope.currentProject.startDate;
      $scope.maxDate = $scope.project.endDate ? $scope.project.endDate : $scope.currentProject.endDate;
        $scope.initEndDate = new Date($scope.minDate);
        $scope.project.startDate= $filter('date')($scope.project.startDate, 'yyyy-MM-dd');
        $scope.project.endDate= $filter('date')($scope.project.endDate, 'yyyy-MM-dd');
    });

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
