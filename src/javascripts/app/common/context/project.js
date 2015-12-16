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
        project = {};

      $rootScope.currentProjectInfo = project;
      $rootScope.allProjects = [];

      service.setProject = function(pj) {
        if(pj) {
          var oldProject = angular.copy($rootScope.currentProjectInfo);
          project = $rootScope.currentProjectInfo = pj;
          notifications.currentProjectChanged({
            oldProject: oldProject,
            newProject: pj
          });
        }

        service.saveLocal({
          project: project
        });
      };

      service.clearInfo = function() {
        notifications.currentProjectChanged({
          oldProject: angular.copy($rootScope.currentProjectInfo),
          newProject: null
        });
        project = $rootScope.currentProjectInfo = {};
        $rootScope.allProjects = [];
        service.saveLocal({
          project: project
        });
      };

      service.saveLocal = function(obj) {
        obj = obj || {};
        storage.set('projectData', obj);
      };

      service.loadProject = function() {
        var data = storage.get('projectData');
        data = data || {};
        service.setProject(data.project || null);
      };

      service.project = function() {
        return project;
      };

      service.valid = function() {
        return $rootScope.currentProjectInfo && angular.isDefined($rootScope.currentProjectInfo.projectId);
      };

      return service;
    }]);
  return module;
});