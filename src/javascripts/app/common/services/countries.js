/**
 * Created by thophan on 8/10/2015.
 */
/* jslint plusplus: true */
define(function(require) {
    'use strict';
    var angular = require('angular'),
        module,
        countryListData = require('text!app/common/resources/countries.json');

    module = angular.module('common.services.countries', []);

    module.factory('countriesResource',
        ['$http',
            function($http) {
                var service = {};
                service.getCountryList = function() {
                    var countryListJson = JSON.parse(countryListData);
                    return countryListJson;
                };
                
                service.getStateList = function (fileName) {
                    //var stateListData = require(['text!app/common/resources/countries/' + fileName + '.json']);
                    return $http.get('javascripts/app/common/resources/countries/' + fileName + '.json');
                };

                return service;
            }
        ]
    );
});