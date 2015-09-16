/**
 * Created by thophan on 8/17/2015.
 */
define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'userContext', 'projectFactory', 'activityFactory', 'toaster', '$filter', 'notifications', 'taskFactory', 'userNotificationsFactory', 'appConstant',
    function ($scope, $rootScope, userContext, projectFactory, activityFactory, toaster, $filter, notifications, taskFactory, userNotificationsFactory, appConstant){

      $scope.currentProject = $rootScope.currentProjectInfo;
      var activity = $rootScope.activitySelected;

      $scope.project = {
        projectParentId: $scope.currentProject.projectId,
        projectTypeId: activity.projectTypeId,
        projectId: activity.projectId,
        projectName: activity.projectName,
        projectDescription: activity.projectDescription,
        companyId: activity.company.companyId,
        startDate: activity.startDate,
        endDate: activity.endDate,
        status: activity.status
      };

      var dateDiff = function (startDate, endDate){
        return new Date(endDate) - new Date(startDate);
      };

      var maxStartDate = activity.endDate, minEndDate = activity.startDate;
      var getProject = function (){
        taskFactory.getProjectTaskByActivity($rootScope.activitySelected.projectId).then(
          function (resp){
            var tasks = resp.data.tasks;

            //get date area of tasks
            _.forEach(tasks, function (n){
              if (dateDiff(n.startDate, maxStartDate) > 0) {
                maxStartDate = n.startDate;
              }
              if (dateDiff(n.endDate, minEndDate) < 0) {
                minEndDate = n.endDate;
              }
            });
          },
          function (err){
            console.log(err);
          }
        ).finally(
          function (){
            $scope.minDate2 = $scope.currentProject.startDate;
            $scope.maxDate2 = $scope.currentProject.endDate;
            $scope.initStartDate = new Date($scope.minDate2);

            $scope.minDate = $scope.project.startDate ? $scope.project.startDate : $scope.currentProject.startDate;
            $scope.minDate = dateDiff($scope.minDate, minEndDate) < 0 ? $scope.minDate : minEndDate;
            $scope.maxDate = $scope.project.endDate ? $scope.project.endDate : $scope.currentProject.endDate;
            $scope.maxDate = dateDiff(maxStartDate, $scope.maxDate) > 0 ? maxStartDate : $scope.maxDate;
            $scope.initEndDate = $filter('date')(new Date($scope.minDate), 'yyyy-MM-dd');
          });
      };

      getProject();


      $scope.model = {
        userId: userContext.authentication().userData.userId,
        project: $scope.project
      };

      /*$scope.minDate2 = $scope.currentProject.startDate;
       $scope.maxDate2 = $scope.currentProject.endDate;
       $scope.initStartDate = new Date($scope.minDate2);

       $scope.minDate = $scope.project.startDate ? $scope.project.startDate : $scope.currentProject.startDate;
       $scope.minDate = dateDiff($scope.minDate, minEndDate) < 0 ? $scope.minDate : minEndDate;
       $scope.maxDate = $scope.project.endDate ? $scope.project.endDate : $scope.currentProject.endDate;
       $scope.maxDate = dateDiff(maxStartDate, $scope.maxDate) > 0 ? maxStartDate : $scope.maxDate;
       $scope.initEndDate = new Date($scope.minDate);*/

      $scope.$watchCollection('[project.startDate, project.endDate]', function (e){
        $scope.minDate = $scope.project.startDate ? $scope.project.startDate : $scope.currentProject.startDate;
        $scope.minDate = dateDiff($scope.minDate, minEndDate) < 0 ? $scope.minDate : minEndDate;
        $scope.maxDate = $scope.project.endDate ? $scope.project.endDate : $scope.currentProject.endDate;
        $scope.maxDate = dateDiff(maxStartDate, $scope.maxDate) > 0 ? maxStartDate : $scope.maxDate;
        $scope.initEndDate = $filter('date')(new Date($scope.minDate), 'yyyy-MM-dd');
        $scope.project.startDate = $filter('date')($scope.project.startDate, 'yyyy-MM-dd');
        $scope.project.endDate = $filter('date')($scope.project.endDate, 'yyyy-MM-dd');
      });


      $scope.projectStatuses = projectFactory.getProjectStatuses();
      $scope.companies = $rootScope.companies;

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
            //$modalInstance.close({});
            notifications.activityEdited();
            userNotificationsFactory.getAll({
              "pageNumber": 1,
              "perPageLimit": appConstant.app.settings.userNotificationsPageSize
            }).then(function (resp){
              $rootScope.userNotifications = resp.data;
              notifications.getNotificationSuccess();
            });
          }, function (err){
            $scope.onSubmit = false;
            $scope.form.$setPristine();
          }
        );
      };
      $scope.cancel = function (){
        //$modalInstance.dismiss('cancel');
        notifications.cancelActivity();
      };

      var setTaskListHeight = function (){
        var activityHeadingHeight = document.getElementById('activity-list-heading').offsetHeight;

        document.getElementById('activity-edit-panel').setAttribute("style", "height:" + (activityHeadingHeight + 538) + "px");
      };

      setTaskListHeight();
    }];
  return controller;
});
