/**
 * Created by thophan on 8/11/2015.
 */
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    module,
    projectStatuses = require('text!app/common/resources/projectStatuses.json'),
    projectTypes = require('text!app/common/resources/projectTypes.json'),
    unitOfMeasurements = require('text!app/common/resources/unitOfMeasurements.json');

  module = angular.module('common.services.project', ['app.config']);

  module.factory('projectFactory',
    ['appConstant', '$http',
      function(constant, $http) {
        var service = {};

        service.getUserProject = function(model) {
          return $http.post(constant.domain + '/project/getProjectsByUser/', model);
        };

        service.getProjectById = function(projectId){
          return $http.post(constant.domain + '/project/getProject', {
            projectId: projectId
          });
        };

        service.addProject = function(model) {
          return $http.post(constant.domain + '/project/addProject', model);
        };

        service.deleteProject = function(model) {
          return $http.post(constant.domain + '/project/deleteProject', model);
        };

        service.getProjectStatuses = function() {
          return angular.fromJson(projectStatuses);
        };

        service.getProjectTypes = function() {
          return angular.fromJson(projectTypes);
        };

        service.getProjectUnitOfMeasurements = function() {
          return angular.fromJson(unitOfMeasurements);
        };

        service.getBudgetMeterData = function(projectId) {
          return $http.post(constant.domain + '/report/earnedValueReport', {
            projectId: projectId
          });
        };

        service.getDashboardBi = function(projectId) {
          return $http.post(constant.domain + '/report/bireport', {
            projectId: projectId
          });
        };

        service.getTaskCount = function (projectId){
          return $http.post(constant.domain + '/tasks/getTaskCountsOfProject', {
            projectId: projectId
          });
        };

        service.getActivityLog = function (data){
          return $http.post(constant.domain + '/activityLog/getLog', data);
        };
        return service;
      }
    ]
  );
});