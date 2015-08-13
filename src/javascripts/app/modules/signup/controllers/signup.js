define(function (){
  'use strict';
  var controller = ['$scope', 'userContext', '$state', 'appConstant', 'accountFactory', 'uploadFile', '$timeout', 'registrationTokenData',
    function ($scope, userContext, $state, appConstant, accountFactory, uploadFile, $timeout, registrationTokenData){
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

      if (registrationTokenData.returnVal === "SUCCESS") {
        $scope.displayForm = true;
        $scope.user = {
          email: registrationTokenData.userRegistration.email,
          registrationToken: registrationTokenData.collaborateToken,
          firstName: registrationTokenData.userRegistration.firstName,
          lastName: registrationTokenData.userRegistration.lastName,
          areaCode: registrationTokenData.userRegistration.companyZip
        };
      }
      else if (registrationTokenData.returnVal) {
        $scope.displayForm = false;
      }

      $scope.app = appConstant.app;
      $scope.authError = '';
      $scope.displayForm = false;
      $scope.isUploadAvatar = false;

      $scope.registerUser = function (user, form){
        if(form.$invalid)
        {
          return false;
        }
        accountFactory.registerOntargetUser(user).success(function (data){
          if (data.returnVal === "SUCCESS") {
            $state.go('signin');
          }
          $scope.form.$setPristine();
        })
          .error(function (data){
            console.log(data);
            $scope.form.$setPristine();
          });
      };


      $scope.$watch('file', function (){
        if ($scope.file) {
          $scope.upload([$scope.file]);
        }
      });

      $scope.log = '';

      function upload(file){
        $scope.isUploadAvatar = true;
        uploadFile.upload(file).progress(function (evt){
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          //$scope.log = 'progress: ' + progressPercentage + '% ' +
          //  evt.config.file.name + '\n' + $scope.log;
          $scope.percentage = progressPercentage;
        }).success(function (data, status, headers, config){
          $timeout(function (){
            //$scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
            $scope.user.userImagePath = 'assets/profile/' + data.imageName;
            $scope.isUploadAvatar = false;
          });
        })
          .error(function (){
            $scope.isUploadAvatar = false;
          });
      }

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