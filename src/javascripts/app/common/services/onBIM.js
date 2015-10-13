/**
 * Created by aashiskhanal on 10/9/15.
 */

define(function(require) {
  'use strict';
  var angular = require('angular'),
    module;

  module = angular.module('common.services.onBIM', ['app.config']);

  module.factory('onBIMFactory',
    ['appConstant', '$http',
      function(constant, $http) {
        var service = {};

        //service.getBIMList = function(projectId,userId) {
        //  var reqParams = {
        //    "baseRequest": {
        //      "loggedInUserId": userId,
        //      "loggedInUserProjectId": projectId
        //    },
        //    "projectId": projectId
        //  };
        //  console.log("parampassed:: "+JSON.stringify(reqParams));
        //  return $http.post(constant.domain + '/project/getProjectMembers', reqParams);
        //};


        return service;
      }
    ]
  );
});
