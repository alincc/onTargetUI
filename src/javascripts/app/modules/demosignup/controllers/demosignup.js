/**
 * Created by thophan on 8/10/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', 'userContext', '$state', '$stateParams', 'appConstant', 'accountFactory', 'countryFactory', 'fileFactory', 'appConstant', '$q', 'toaster',
    function($scope, userContext, $state, $stateParams, appConstant, accountFactory, countryFactory, fileFactory, constant, $q, toaster) {

      var getCountryFileName = function(countryCode) {
        var fileName = _($scope.countries)
          .filter(function(country) {
            return country.code === countryCode;
          })
          .pluck('filename')
          .value();

        return fileName[0];
      };

      $scope.user = {
        email: $stateParams.email,
        firstName: '',
        lastName: '',
        phoneNumber: '',
        msg: '',
        companyName: '',
        companyTypeId: '',
        companyAddress1: '',
        companyAddress2: '',
        companyCity: '',
        companyCountry: '',
        companyState: '',
        companyZip: '',
        companyLogoPath: ''
      };

      $scope.countries = countryFactory.getCountryList();

      $scope.app = appConstant.app;
      $scope.signupMsg = '';
      $scope.uploadModel = {
        file: null
      };

      $scope.getStateList = function() {
        var fileName = getCountryFileName($scope.user.companyCountry);
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

      $scope.demoSignup = function(model) {
        if($scope.form.$invalid) {
          return false;
        }

        accountFactory.demoSignup(model).then(
          function(resp) {
            $scope.signupMsg = 'Your registration request has been sent successfully.';
            $scope.form.$setPristine();
          }, function(err) {
            $scope.form.$setPristine();
          }
        );
      };

      $scope.$watch('uploadModel.file', function() {
        if($scope.uploadModel.file) {
          if(constant.app.allowedImageExtension.test($scope.uploadModel.file.type)) {
            var deferred = $q.defer();
            fileFactory.upload($scope.uploadModel.file, null, 'companylogo', null, null, true)
              .success(function(data, status, headers, config) {
                $scope.user.companyLogoPath = data.url;

                deferred.resolve({
                  filePath: data.url,
                  fileName: data.name,
                  fileType: $scope.uploadModel.file.type
                });
              })
              .error(function(err) {
                deferred.reject(err);
              });

            $scope.isLoading = false;
            //return deferred.promise;
          }
          else {
            toaster.pop('error', 'Error', 'Only accept jpg, png file');
          }
        }
      });
    }];
  return controller;
});