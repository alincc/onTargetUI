/**
 * Created by aashiskhanal on 9/1/15.
 */

define(function(require) {
    'use strict';
    var angular = require('angular'),
        module;

    module = angular.module('common.services.onContact', ['app.config']);

    module.factory('onContactFactory',
        ['appConstant', '$http',
            function(constant, $http) {
                var service = {};

                service.getContactList = function(projectId,userId) {
                    var reqParams = {
                        "baseRequest": {
                            "loggedInUserId": userId,
                            "loggedInUserProjectId": projectId
                        },
                        "projectId": projectId
                    };
                    console.log("parampassed:: "+JSON.stringify(reqParams));
                    return $http.post(constant.domain + '/project/getProjectMembers', reqParams);
                };


                return service;
            }
        ]
    );
});
