define(function(require) {
  'use strict';
  var angular = require('angular'),
    angularLocalStorage = require('angularLocalStorage');
  var module = angular.module('common.context.project', ['angularLocalStorage']);
  module.factory('projectContext', ['storage', '$q', '$rootScope', function(storage, $q, $rootScope) {
    var service = {},
      project = {},
      parentProject = {
        projectId: 1
      },
      allProjects = [],
      mainProject = {};

    $rootScope.currentProjectInfo = project;
    $rootScope.allProjects = [];
    $rootScope.mainProjectInfo = mainProject;

    service.getMainProject = function() {
      return parentProject;
    };

    service.setProject = function(pj, allPj) {
      if(pj) {
        project = $rootScope.currentProjectInfo = pj;
      }

      if(allPj) {
		mainProject = $rootScope.mainProjectInfo = allPj;
        allProjects = $rootScope.allProjects = allPj;
      }
	  
      service.saveLocal({
        project: project,
        allProjects: allPj.projects || allProjects,
        mainProject: mainProject
      });
    };

    service.clearInfo = function() {
      project = $rootScope.currentProjectInfo = {};
      allProjects = $rootScope.allProjects = [];
      service.saveLocal({
        project: project,
        allProjects: allProjects,
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
      service.setProject(data.project || {}, data.allProjects || []);
    };

    service.project = function() {
      return project;
    };

    service.allProjects = function() {
      return allProjects;
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