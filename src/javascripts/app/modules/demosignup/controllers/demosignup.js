/**
 * Created by thophan on 8/10/2015.
 */
define(function() {
  'use strict';
  var controller = ['$scope', 'userContext', '$state', '$stateParams', 'appConstant', 'accountFactory', 'countryFactory', function($scope, userContext, $state, $stateParams, appConstant, accountFactory, countryFactory) {
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
      companyZip: ''
    };

    $scope.countries = countryFactory.getCountryList();

    $scope.app = appConstant.app;
    $scope.signupMsg = '';

    $scope.getStateList = function() {
      var fileName = getCountryFileName($scope.user.companyCountry);
      if(fileName !== undefined) {
        countryFactory.getStateList(fileName).then(
          function(resp) {
            $scope.states = resp.data;
          }, function(err) {
            $scope.states = {};
          }
        );
      } else {
        $scope.states = {};
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
  }];
  return controller;
});