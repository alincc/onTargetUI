/**
 * Created by thophan on 8/12/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', '$rootScope', '$modalInstance', 'countryFactory', 'projectFactory', 'userContext', 'projectContext', 'uploadFactory', 'appConstant', 'toaster', '$timeout',
    function($scope, $rootScope, $modalInstance, countryFactory, projectFactory, userContext, projectContext, uploadFactory, appConstant, toaster, $timeout) {

      $scope.projectModel = {
        projectId: null,
        projectParentId: projectContext.mainProject().projectId,
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
        companyId: projectContext.mainProject().companyId,
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
        userId: userContext.authentication().userData.userId,
        accountStatus: userContext.authentication().userData.accountStatus
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
        /* if ($scope.project_form.$invalid) {
         return false;
         }*/
        $scope.onSubmit = true;
        projectFactory.addProject($scope.model).then(
          function(resp) {
            toaster.pop('success', 'Success', resp.data.returnMessage);
            $scope.project_form.$setPristine();
            $modalInstance.close({});
          }, function(err) {
            $scope.onSubmit = false;
            console.log(err);
          }
        );
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
        uploadFactory.upload(file, 'project').progress(function(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.picture.percentage = progressPercentage;
        }).success(function(data, status, headers, config) {
          $timeout(function() {
            $scope.projectModel.projectImagePath = 'assets/project/' + data.imageName;
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

    }];
  return controller;
});