define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', 'userContext', '$state', 'accountFactory', 'notifications', 'fileFactory', '$timeout', 'appConstant', 'toaster',
    function($scope, $rootScope, userContext, $state, accountFactory, notifications, fileFactory, $timeout, appConstant, toaster) {

      $scope.editUserData = {
        userId: $rootScope.currentUserInfo.userId,
        title: $rootScope.currentUserInfo.contact.title,
        areaCode: $rootScope.currentUserInfo.contact.areaCode,
        email: $rootScope.currentUserInfo.contact.email,
        firstName: $rootScope.currentUserInfo.contact.firstName,
        lastName: $rootScope.currentUserInfo.contact.lastName,
        phoneNumber: $rootScope.currentUserInfo.contact.phoneNumber,
        userImagePath: $rootScope.currentUserInfo.contact.userImagePath
      };

      function updateUserProfile(model) {
        accountFactory.updateProfile(model)
          .then(function() {
            $scope.form.$setPristine();

            $rootScope.currentUserInfo.contact.firstName = $scope.editUserData.firstName;
            $rootScope.currentUserInfo.contact.lastName = $scope.editUserData.lastName;
            $rootScope.currentUserInfo.contact.email = $scope.editUserData.email;
            $rootScope.currentUserInfo.contact.userImagePath = $scope.editUserData.userImagePath;
            $rootScope.currentUserInfo.contact.title = $scope.editUserData.title;
            $rootScope.currentUserInfo.contact.phoneNumber = $scope.editUserData.phoneNumber;

            // Save user info to local storage
            userContext.fillInfo(angular.copy($rootScope.currentUserInfo), true);

            notifications.updateProfileSuccess();
          },
          function(er) {
            $scope.form.$setPristine();
          });
      }

      function submitUserProfile(model) {
        if($scope.isAvatarChanged) {
          fileFactory.move($scope.editUserData.userImagePath, null, 'profile')
            .success(function(resp) {
              model.userImagePath = resp.url;
              $scope.editUserData.userImagePath = resp.url;
              updateUserProfile(model);
            });
        } else {
          updateUserProfile(model);
        }
      }

      $scope.submitUserProfile = submitUserProfile;

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

      function upload(file) {
        $scope.isUploadAvatar = true;
        fileFactory.upload(file, null, 'temp', null, null, true)
          .progress(function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.percentage = progressPercentage;
          }).success(function(data, status, headers, config) {
            $timeout(function() {
              $scope.editUserData.userImagePath = data.url;
              $scope.isUploadAvatar = false;
              $scope.isAvatarChanged = true;
            });
          })
          .error(function() {
            $scope.isUploadAvatar = false;
          });
      }

      $scope.isUploadAvatar = false;
      $scope.isAvatarChanged = false;
      $scope.percentage = 0;

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
