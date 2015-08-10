/**
 * Created by thophan on 8/10/2015.
 */
define(function() {
    'use strict';
    var controller = ['$scope', 'userContext', '$state', '$stateParams', 'appConstant', 'accountFactory', 'countriesResource', function($scope, userContext, $state, $stateParams, appConstant, accountFactory, countriesResource) {
        $scope.user = {
            email: $stateParams.email,
            firstName : '',
            lastName : '',
            phoneNumber : '',
            msg : '',
            companyName : '',
            companyTypeId : '',
            companyAddress1 : '',
            companyAddress2 : '',
            companyCity : '',
            companyCountry : '',
            companyState : '',
            companyZip : ''
        };

        $scope.countries = countriesResource.getCountryList();

        $scope.app = appConstant.app;
        $scope.signupMsg = '';

        $scope.getStateList = function () {
            var fileName = getCountryFileName($scope.user.companyCountry);
            if(fileName !== undefined)
            {
                countriesResource.getStateList(fileName).then(
                    function (resp) {
                        $scope.states = resp.data;
                    }, function (err) {
                        $scope.states = {};
                    }
                );
            }else{
                $scope.states = {};
            }
        };
        
        var getCountryFileName = function (countryCode) {
            var fileName = _($scope.countries)
                .filter(function(country) { return country.code === countryCode; })
                .pluck('filename')
                .value();

            return fileName[0];
            //var result = $.grep($scope.countries, function(e){ return e.code == countryCode; });
        };

        $scope.demoSignup = function (model) {
            console.log(model);
            accountFactory.demoSignup(model).then(
                function (resp) {
                    $scope.signupMsg = 'Your registration request has been sent successfully.';
                    $scope.form.$setPristine();
                }, function (err) {
                    $scope.form.$setPristine();
                }
            );
        };
    }];
    return controller;
});