define(function(require) {
  'use strict';
  var angular = require('angular'),
    angularLocalStorage = require('angularLocalStorage');
  var module = angular.module('common.context.project', ['angularLocalStorage']);
  module.factory('projectContext', ['storage', '$q', '$rootScope', function(storage, $q, $rootScope) {
    var service = {},
      project = {},
      mainProject = {};

    $rootScope.currentProjectInfo = project;

    $rootScope.mainProjectInfo = mainProject;

    service.setProject = function(pj, mJ) {
      if(pj) {
        project = $rootScope.currentProjectInfo = pj;
      }

      if(mJ) {
        mainProject = $rootScope.mainProjectInfo = mJ;
      }

      service.saveLocal({
        project: project,
        mainProject: mainProject
      });
    };

    service.clearInfo = function() {
      project = $rootScope.currentProjectInfo = mainProject = $rootScope.mainProjectInfo = {};
      service.saveLocal({
        project: project,
        mainProject: mainProject
      });
    };

    service.saveLocal = function(obj) {
      obj = obj || {};
      storage.set('projectData', obj);
    };

    service.loadProject = function() {
      var data = storage.get('projectData');
      data = data || {};
      service.setProject(data.project || {}, data.mainProject || {});
    };

    service.project = function() {
      return project;
    };

    service.mainProject = function() {
      return mainProject;
    };

    service.valid = function() {
      return $rootScope.currentProjectInfo && angular.isDefined($rootScope.currentProjectInfo.projectId) && $rootScope.mainProjectInfo && angular.isDefined($rootScope.mainProjectInfo.projectId);
    };

    return service;
  }]);
  return module;
});