/**
 * Created by thophan on 8/12/2015.
 */
define(function() {
  'use strict';
  var controller = [
    '$scope',
    '$rootScope',
    'countryFactory',
    'projectFactory',
    'userContext',
    'projectContext',
    'fileFactory',
    'appConstant',
    'toaster',
    '$timeout',
    '$filter',
    '$state',
    'companyFactory',
    'project',
    'companies',
    'activityFactory',
    'utilFactory',
    function($scope,
             $rootScope,
             countryFactory, projectFactory,
             userContext, projectContext,
             fileFactory, appConstant,
             toaster,
             $timeout,
             $filter,
             $state,
             companyFactory,
             project,
             companies,
             activityFactory,
             utilFactory) {

      var getCountryFileName = function(countryCode) {
        var fileName = _($scope.countries)
          .filter(function(country) {
            return country.code === countryCode;
          })
          .pluck('filename')
          .value();

        return fileName[0];
      };

      var dateDiff = function(startDate, endDate) {
        return new Date(endDate) - new Date(startDate);
      };

      $scope.maxStartDate = project.endDate;
      $scope.minEndDate = project.startDate;
      var getActivityDateRange = function() {
        activityFactory.getActivityOfProject(project.projectId)
          .success(function(resp) {
            var activities = resp.projects;
            _.forEach(activities, function(activity) {
              if(dateDiff(activity.startDate, $scope.maxStartDate) > 0) {
                $scope.maxStartDate = activity.startDate;
              }
              if(dateDiff(activity.endDate, $scope.minEndDate) < 0) {
                $scope.minEndDate = activity.endDate;
              }
            });
          }
        );
      };
      getActivityDateRange();

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


      $scope.projectModel = {
        projectId: project.projectId,
        projectParentId: project.projectParentId,
        projectTypeId: project.projectTypeId,
        projectAddress: {
          address1: project.projectAddress.address1,
          address2: project.projectAddress.address2,
          city: project.projectAddress.city,
          state: project.projectAddress.state,
          country: project.projectAddress.country,
          zip: project.projectAddress.zip,
          addressId: project.projectAddress.addressId
        },
        companyId: project.company.companyId,
        projectName: project.projectName,
        projectDescription: project.projectDescription,
        status: project.status.toString(),
        startDate: project.startDate,
        endDate: project.endDate,
        unitOfMeasurement: project.projectConfiguration[0].configValue,
        projectImagePath: project.projectImagePath,
        projectAssetFolderName: project.projectAssetFolderName || utilFactory.makeId(20)
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
      $scope.companies = companies;
      $scope.forms = {};
      $scope.editProject = true;
      $scope.addProject = false;
      $scope.onSubmit = false;


      $scope.getStateList = function() {
        var fileName = getCountryFileName($scope.projectModel.projectAddress.country);
        if(fileName !== undefined) {
          countryFactory.getStateList(fileName).then(
            function(resp) {
              $scope.states = resp;
            }, function(err) {
              $scope.states = {};
            }
          );
        } else {
          $scope.states = {};
        }
      };

      $scope.getStateList();

      $scope.save = function() {
        $scope.model.project.startDate = $filter('datetime')($scope.model.project.startDate);
        $scope.model.project.endDate = $filter('datetime')($scope.model.project.endDate);

        $scope.onSubmit = true;

        var updateProject = function() {
          projectFactory.addProject($scope.model).then(
            function(resp) {
              $scope.project_form.$setPristine();
              delete $rootScope.editProject;
              delete $rootScope.companies;
              $state.go('app.projectlist');
            }, function(err) {
              $scope.onSubmit = false;
              $scope.project_form.$setPristine();
              console.log(err);
            }
          );
        };

        if($scope.picture.isUploadedPicture) {
          fileFactory.move($filter('filePath')($scope.projectModel.projectImagePath, 'relative'), null, 'projects', $scope.model.project.projectAssetFolderName)
            .success(function(resp) {
              $scope.model.project.projectImagePath = resp.url;
              updateProject();
            });
        } else {
          updateProject();
        }
      };

      $scope.cancel = function() {
        //$modalInstance.dismiss('cancel');
        delete $rootScope.editProject;
        delete $rootScope.companies;
        $state.go('app.projectlist');
      };

      $scope.picture = {
        file: null,
        percentage: 0,
        isUploadPicture: false,
        isUploadedPicture: false
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
              $scope.projectModel.projectImagePath = $filter('filePath')(data.url, 'node');
              $scope.picture.isUploadPicture = false;
              $scope.picture.isUploadedPicture = true;
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