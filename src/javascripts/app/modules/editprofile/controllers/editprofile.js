define(function (){
  'use strict';
  var controller = ['$scope', '$rootScope', 'userContext', '$state', 'accountFactory', 'notifications', 'uploadFile', '$timeout', 'appConstant', 'toaster',
    function ($scope, $rootScope, userContext, $state, accountFactory, notifications, uploadFile, $timeout, appConstant, toaster){

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

      function submitUserProfile(model){

        accountFactory.updateProfile(model)
          .then(function (){
            $scope.form.$setPristine();

            $rootScope.currentUserInfo.contact.firstName = $scope.editUserData.firstName;
            $rootScope.currentUserInfo.contact.lastName = $scope.editUserData.lastName;
            $rootScope.currentUserInfo.contact.email = $scope.editUserData.email;
            $rootScope.currentUserInfo.contact.userImagePath = $scope.editUserData.userImagePath;

            notifications.updateProfileSuccess();
          },
          function (er){
            console.log(er);
            $scope.form.$setPristine();
          });
      }

      $scope.submitUserProfile = submitUserProfile;

      $scope.$watch('file', function (){
        if ($scope.file) {
          if (appConstant.app.allowedImageExtension.test($scope.file.type)) {
            $scope.upload([$scope.file]);
          }
          else {
            toaster.pop('error', 'Error', 'Only accept jpg, png file');
          }
        }
      });

      function upload(file){
        $scope.isUploadAvatar = true;
        uploadFile.upload(file).progress(function (evt){
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.percentage = progressPercentage;
        }).success(function (data, status, headers, config){
          $timeout(function (){
            //$scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
            $scope.editUserData.userImagePath = 'assets/profile/' + data.imageName;
            $scope.isUploadAvatar = false;
          });
        })
          .error(function (){
            $scope.isUploadAvatar = false;
          });
      }

      $scope.isUploadAvatar = false;
      $scope.percentage = 0;

      $scope.upload = function (files){
        if (files && files.length) {
          for (var i = 0; i < files.length; i++) {
            upload(files[i]);
          }
        }
      };

    }];
  return controller;
});
