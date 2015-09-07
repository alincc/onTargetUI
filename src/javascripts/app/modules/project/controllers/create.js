/**
 * Created by thophan on 8/12/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'fileFactory', 'appConstant', 'toaster', '$timeout', '$filter',
    function($scope, $rootScope, $modalInstance, countryFactory, projectFactory, userContext, projectContext, fileFactory, appConstant, toaster, $timeout, $filter) {

      $scope.projectModel = {
        projectId: null,
        projectParentId: $rootScope.mainProjectInfo.projectId,
        projectTypeId: "",
        projectAddress: {
          address1: "",
          address2: "",
          city: "",
          state: "",
          country: "",
          zip: "",
          addressId: ""
        },
        companyId: $rootScope.mainProjectInfo.companyId,
        projectName: "",
        projectDescription: "",
        status: "",
        startDate: "",
        endDate: "",
        unitOfMeasurement: "",
        projectImagePath: ""
      };

      $scope.startDate = {
        options: {
          formatYear: 'yyyy',
          startingDay: 1
        },
        isOpen: false,
        open: function($event) {
          this.isOpen = true;
        }
      };

      $scope.endDate = {
        options: {
          formatYear: 'yyyy',
          startingDay: 1
        },
        isOpen: false,
        open: function($event) {
          this.isOpen = true;
        }
      };

      $scope.model = {
        project: $scope.projectModel,
        userId: $rootScope.currentUserInfo.userId,
        accountStatus: $rootScope.currentUserInfo.accountStatus
      };

      $scope.countries = countryFactory.getCountryList();
      $scope.projectStatuses = projectFactory.getProjectStatuses();
      $scope.projectTypes = projectFactory.getProjectTypes();
      $scope.unitOfMeasurements = projectFactory.getProjectUnitOfMeasurements();
      $scope.forms = {};
      $scope.editProject = false;
      $scope.addProject = true;
      $scope.onSubmit = false;
      $scope.app = appConstant.app;

      $scope.getStateList = function() {
        var fileName = getCountryFileName($scope.projectModel.projectAddress.country);
        if(fileName !== undefined) {
          countryFactory.getStateList(fileName).then(
            function(resp) {
              $scope.states = resp;
            }, function(err) {
              $scope.states = [];
            }
          );
        } else {
          $scope.states = [];
        }
      };

      var getCountryFileName = function(countryCode) {
        var fileName = _($scope.countries)
          .filter(function(country) {
            return country.code === countryCode;
          })
          .pluck('filename')
          .value();

        return fileName[0];
      };

      $scope.save = function() {
        $scope.onSubmit = true;
        fileFactory.move($scope.projectModel.projectImagePath, null, 'projects', $rootScope.currentProjectInfo.projectId)
          .success(function(resp) {
            $scope.model.project.projectImagePath = resp.url;
            projectFactory.addProject($scope.model).then(function(resp) {
              $scope.project_form.$setPristine();
              $modalInstance.close({});
            }, function(err) {
              $scope.onSubmit = false;
              console.log(err);
            });
          });
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      $scope.picture = {
        file: null,
        percentage: 0,
        isUploadPicture: false
      };
      $scope.$watch('picture.file', function() {
        if($scope.picture.file) {
          if(appConstant.app.allowedImageExtension.test($scope.picture.file.type)) {
            $scope.upload([$scope.picture.file]);
          }
          else {
            toaster.pop('error', 'Error', 'Only accept jpg, png file');
          }
        }
      });

      function upload(file) {
        $scope.picture.isUploadPicture = true;
        fileFactory.upload(file, null, 'temp', null, null, true)
          .progress(function(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.picture.percentage = progressPercentage;
        }).success(function(data, status, headers, config) {
          $timeout(function() {
            $scope.projectModel.projectImagePath = data.url;
            $scope.picture.isUploadPicture = false;
          });
        })
          .error(function() {
            $scope.picture.isUploadPicture = false;
          });
      }

      $scope.upload = function(files) {
        if(files && files.length) {
          for(var i = 0; i < files.length; i++) {
            upload(files[i]);
          }
        }
      };

      $scope.$watchCollection('[projectModel.startDate, projectModel.endDate]', function(e) {
        $scope.projectModel.startDate = $filter('date')($scope.projectModel.startDate, 'yyyy-MM-dd');
        $scope.projectModel.endDate = $filter('date')($scope.projectModel.endDate, 'yyyy-MM-dd');
      });

    }];
  return controller;
});