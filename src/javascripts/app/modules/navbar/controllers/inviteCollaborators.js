define(function(require) {
  'use strict';
  var angular = require('angular'),
    companyTypesData = require('text!app/common/resources/companyTypes.json');
  var controller = ['$scope', 'companies', 'countryFactory', '$modalInstance', 'accountFactory',
    'inviteCollaboratorFactory', '$rootScope',
    function($scope, companies, countryFactory, $modalInstance, accountFactory,
             inviteCollaboratorFactory, $rootScope) {
      $scope.addNewCompany = false;
      $scope.sentSuccess = false;
      $scope.companies = companies;

      $scope.companyTypes = angular.fromJson(companyTypesData);
      $scope.newCollaborator = {};
      $scope.countries = countryFactory.getCountryList();

      $scope.existingCompany = {
        id: -1,
        name: '-- Select --',
        isChanged: false
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

      $scope.getStateList = function() {
        var fileName = getCountryFileName($scope.newCollaborator.country);
        if(fileName !== undefined) {
          countryFactory.getStateList(fileName).then(
            function(resp) {
              $scope.states = resp;
            }, function(err) {
              $scope.states = {};
            }
          );
        }
        else {
          $scope.states = {};
        }
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
      $scope.inviteCollaborator = function() {
        var requestPayload;
        if($rootScope.currentProjectInfo && $rootScope.currentProjectInfo.projectId) {
          if(!$scope.addNewCompany) {
            requestPayload = {
              projectId: $rootScope.currentProjectInfo.projectId,
              firstName: $scope.firstName,
              lastName: $scope.lastName,
              email: $scope.email,
              companyId: $scope.existingCompany.id
            };
          }
          else {
            requestPayload = {
              companyAddress1: $scope.newCollaborator.addressOne,
              companyAddress2: $scope.newCollaborator.addressTwo,
              companyCity: $scope.newCollaborator.city,
              companyCountry: $scope.newCollaborator.country,
              companyName: $scope.newCollaborator.companyName,
              companyState: $scope.newCollaborator.state,
              companyTypeId: $scope.newCollaborator.companyType,
              companyZip: $scope.newCollaborator.zip,
              email: $scope.email,
              firstName: $scope.firstName,
              lastName: $scope.lastName,
              projectId: $rootScope.currentProjectInfo.projectId,
              companyId: 0
            };
          }
        }

        inviteCollaboratorFactory.invite(requestPayload)
          .success(function(resp) {
            $scope.sentSuccess = true;
            $scope.cancel();
          })
          .error(function(error) {
            $scope.form.$setPristine();
            $scope.sentSuccess = false;
          });
      };

      $scope.companyChanged = function(id, name) {
        $scope.existingCompany.id = id;
        $scope.existingCompany.name = name;
        $scope.existingCompany.isChanged = true;

        $scope.addNewCompany = $scope.existingCompany.id === 0;
      };

      if($scope.newCollaborator.country) {
        $scope.getStateList();
      }
    }
  ];

  return controller;
});