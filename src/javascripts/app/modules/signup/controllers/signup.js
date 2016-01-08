define(function() {
  'use strict';
  var controller = ['$scope', 'userContext', '$state', 'appConstant', 'accountFactory', 'fileFactory', '$timeout', 'registrationTokenData', 'toaster',
    function($scope, userContext, $state, appConstant, accountFactory, fileFactory, $timeout, registrationTokenData, toaster) {
      $scope.user = {
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        title: "",
        userImagePath: "",
        discipline: "",
        registrationToken: "",
        password: "",
        areaCode: "",
        phoneNumber: ""
      };

      if(registrationTokenData.returnVal === "SUCCESS") {
        $scope.displayForm = true;
        $scope.user = {
          email: registrationTokenData.userRegistration.email,
          registrationToken: registrationTokenData.collaborateToken,
          firstName: registrationTokenData.userRegistration.firstName,
          lastName: registrationTokenData.userRegistration.lastName,
          phoneNumber: registrationTokenData.userRegistration.phoneNumber,
          areaCode: registrationTokenData.userRegistration.companyZip ? registrationTokenData.userRegistration.companyZip : ''
        };
      }
      else if(registrationTokenData.returnVal) {
        $scope.displayForm = false;
      }

      $scope.app = appConstant.app;
      $scope.authError = '';
      $scope.displayForm = false;
      $scope.isUploadAvatar = false;
      $scope.isUploadedAvatar = false;

      $scope.registerUser = function(user) {
        console.log(user);
        if($scope.form.$invalid) {
          return false;
        }

        var createUser = function() {
          accountFactory.registerOntargetUser(user).success(function(data) {
            if(data.returnVal === "SUCCESS") {
              $state.go('signin');
            }
            $scope.form.$setPristine();
          })
            .error(function(data) {
              console.log(data);
              $scope.form.$setPristine();
            });
        };

        if($scope.isUploadedAvatar) {
          fileFactory.move($scope.user.userImagePath, null, 'profile')
            .success(function(resp) {
              $scope.user.userImagePath = resp.url;
              user.userImagePath = resp.url;
              createUser();
            });
        } else {
          createUser();
        }
      };

      $scope.$watch('file', function() {
        if($scope.file) {
          if(appConstant.app.allowedImageExtension.test($scope.file.type)) {
            $scope.upload([$scope.file]);
          }
          else {
            toaster.pop('error', 'Error', 'Only accept jpg, png file');
          }
        }
      });

      $scope.log = '';

      function upload(file) {
        $scope.isUploadAvatar = true;
        fileFactory.upload(file, null, 'temp', null, null, true)
          .progress(function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.percentage = progressPercentage;
          }).success(function(data, status, headers, config) {
            $timeout(function() {
              $scope.user.userImagePath = data.url;
              $scope.isUploadAvatar = false;
              $scope.isUploadedAvatar = true;
            });
          })
          .error(function() {
            $scope.isUploadAvatar = false;
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