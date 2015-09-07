define(function() {
  'use strict';
  var controller = ['$scope', 'companyFactory', 'company', 'countryFactory',
    function($scope, companyFactory, company, countryFactory) {
      console.log(company);
      $scope.company = company;
      $scope.countries = countryFactory.getCountryList();

      $scope.updateCompany = function() {
        var param = {
          "company" : {
            "companyId" : $scope.company.companyId,
            "companyName" : $scope.company.companyName,
            "companyTypeId" : $scope.company.companyTypeId,
            "address" : {
              "address1" : $scope.company.address.address1,
              "address2" : $scope.company.address.address2,
              "city" : $scope.company.address.city,
              "state" : $scope.company.address.state,
              "zip" : $scope.company.address.zip,
              "country" : $scope.company.address.country
            }
          }
        };

        companyFactory.update(param)
          .success(function(response) {
            $scope.form.$setPristine();
            console.info(response.returnMessage);
          }).error(function(response) {
            $scope.form.$setPristine();
            console.error('update fail');
          });
      };

      var getCountryFileName = function (countryCode) {
        var fileName = _($scope.countries)
          .filter(function(country) { return country.code === countryCode; })
          .pluck('filename')
          .value();

        return fileName[0];
      };

      $scope.getStateList = function () {
        var fileName = getCountryFileName($scope.company.address.country);
        if(fileName !== undefined)
        {
          countryFactory.getStateList(fileName).then(
            function (resp) {
              $scope.states = resp;
            }, function (err) {
              $scope.states = [];
            }
          );
        }else{
          $scope.states = [];
        }
      };

      if($scope.company.address.country) {
        $scope.getStateList();
      }
    }];
  return controller;
});