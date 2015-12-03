define(function(require) {
  'use strict';
  var angular = require('angular'),
    angularLocalStorage = require('angularLocalStorage'),
    notificationsServiceModule = require('app/common/services/notifications');
  var module = angular.module('common.context.project', [
    'angularLocalStorage',
    'common.services.notifications'
  ]);
  module.factory('projectContext', [
    'storage',
    '$q',
    '$rootScope',
    'notifications',
    function(storage,
             $q,
             $rootScope,
             notifications) {
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
        return mainProject;
      };

      service.setProject = function(pj, mj) {
        if(pj) {
          var oldProject = angular.copy($rootScope.currentProjectInfo);
          project = $rootScope.currentProjectInfo = pj;
          notifications.currentProjectChanged({
            oldProject: oldProject,
            newProject: pj
          });
        }

        if(mj) {
          mainProject = $rootScope.mainProjectInfo = mj;
          allProjects = $rootScope.allProjects = mj.projects;
        }

        service.saveLocal({
          project: project,
          allProjects: allProjects || [],
          mainProject: mainProject || {}
        });
      };

      service.clearInfo = function() {
        project = $rootScope.currentProjectInfo = {};
        allProjects = $rootScope.allProjects = [];
        mainProject = $rootScope.mainProjectInfo = {};
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
        service.setProject(data.project || null, data.mainProject || null);
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