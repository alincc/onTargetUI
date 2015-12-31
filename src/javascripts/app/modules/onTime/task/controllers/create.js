/**
 * Created by thophan on 8/17/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope',
    '$rootScope',
    'userContext',
    'projectFactory',
    'taskFactory',
    'toaster',
    'projectContext',
    'notifications',
    '$filter',
    'userNotificationsFactory',
    'appConstant',
    function($scope,
             $rootScope,
             userContext,
             projectFactory,
             taskFactory,
             toaster,
             projectContext,
             notifications,
             $filter,
             userNotificationsFactory,
             appConstant) {
      $scope.task = {
        projectTaskId: null,
        title: "",
        description: "",
        status: "",
        severity: "",
        startDate: "",
        endDate: "",
        projectId: $rootScope.activitySelected.projectId,
        selectedAssignees: []
      };

      //$scope.minDate2 = $rootScope.activitySelected.startDate;
      //$scope.maxDate2 = $rootScope.activitySelected.endDate;
      //$scope.initStartDate = new Date($scope.minDate2);
      //$scope.$watchCollection('[task.startDate, task.endDate]', function(e) {
      //  $scope.minDate = $scope.task.startDate ? $scope.task.startDate : $rootScope.activitySelected.startDate;
      //  $scope.maxDate = $scope.task.endDate ? $scope.task.endDate : $rootScope.activitySelected.endDate;
      //  $scope.initEndDate = new Date($scope.minDate);
      //  $scope.task.startDate= $filter('date')($scope.task.startDate, 'yyyy-MM-dd');
      //  $scope.task.endDate= $filter('date')($scope.task.endDate, 'yyyy-MM-dd');
      //});

      $scope.model = {
        userId: userContext.authentication().userData.userId,
        task: $scope.task
      };

      //$scope.contacts = $rootScope.contactList || [];

      //$scope.taskStatuses = taskFactory.getTaskStatuses();
      //$scope.taskSeverities = taskFactory.getTaskSeverities();

      //$scope.startDate = {
      //  options: {
      //    formatYear: 'yyyy',
      //    startingDay: 1
      //  },
      //  isOpen: false,
      //  open: function($event) {
      //    this.isOpen = true;
      //  }
      //};
      //
      //$scope.endDate = {
      //  options: {
      //    formatYear: 'yyyy',
      //    startingDay: 1
      //  },
      //  isOpen: false,
      //  open: function($event) {
      //    this.isOpen = true;
      //  }
      //};

      $scope.onSubmit = false;

      $scope.save = function() {
        $scope.onSubmit = true;

        /*$scope.task.startDate= "2015-08-10T00:00:00.000Z";
         $scope.task.endDate= "2015-08-11T00:00:00.000Z";*/

        $scope.model.task.startDate = $filter('datetime')($scope.model.task.startDate);
        $scope.model.task.endDate = $filter('datetime')($scope.model.task.endDate);

        // Filter assignees
        $scope.model.task.assignees = _.map($scope.model.task.selectedAssignees, function(el) {
          return el.userId;
        });

        taskFactory.addTask($scope.model).then(
          function(resp) {
            $scope.onSubmit = false;
            $scope.task_form.$setPristine();
            //$modalInstance.close({});
            notifications.taskCreated();
            //load notification
            //userNotificationsFactory.getAll({
            //  "pageNumber": 1,
            //  "perPageLimit": appConstant.app.settings.userNotificationsPageSize
            //}).then(function (resp){
            //  $rootScope.userNotifications = resp.data;
            //  notifications.getNotificationSuccess();
            //});
          }, function(err) {
            $scope.onSubmit = false;
            $scope.task_form.$setPristine();
          }
        );
      };
      $scope.cancel = function() {
        notifications.taskCancel();
      };
    }];
  return controller;
});
