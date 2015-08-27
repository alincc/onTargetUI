define(function(require) {
  'use strict';
  var angular = require('angular'),
    userContext = require('app/common/context/user'),
    taskStatuses = require('text!app/common/resources/taskStatuses.json'),
    taskSeverities = require('text!app/common/resources/taskSeverities.json'),
    config = require('app/config');
  var module = angular.module('common.services.task', ['app.config', 'common.context.user']);
  module.factory('taskFactory', ['$http', 'appConstant', '$q', 'userContext', function($http, constant, $q, userContext) {
    var services = {};

    //project task
    services.getProjectTasks = function(model, canceler) {
      return $http.post(constant.domain + '/task/getProjectTaskList', model, {
        timeout: canceler.promise
      });
    };

    services.getProjectTasksFull = function(projectId, canceler) {
      return $http.post(constant.domain + '/task/getProjectTask', {
        projecId: projectId
      }, {
        timeout: canceler.promise
      });
    };

    services.getTaskById = function(taskId, canceler){
      return $http.post(constant.domain + '/task/getTaskDetail', {
        taskId: taskId
      }, {
        timeout: canceler.promise
      });
    };

    services.addTask = function(model) {
      return $http.post(constant.domain + '/task/addTask', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.updateTask = function(model) {
      return $http.post(constant.domain + '/task/addTask', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.deleteTask = function(model) {
      return $http.post(constant.domain + '/task/deleteTask', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.getContacts = function(model) {
      return $http.post(constant.resourceUrl + '/contact/getcontacts', model);
    };

    services.getTaskStatuses = function() {
      return angular.fromJson(taskStatuses);
    };

    services.getTaskSeverities = function() {
      return angular.fromJson(taskSeverities);
    };

    services.assignUserToTask = function(model) {
      return $http.post(constant.domain + '/task/assignUserToTask', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.createNewComment = function(model) {
      return $http.post(constant.domain + '/task/addComment', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.updateProgress = function(model) {
      return $http.post(constant.resourceUrl + '/tasks/createnewtaskpercentage', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.getTaskAttachments = function(model) {
      return $http.post(constant.domain + '/task/getTaskAttachments', model);
    };

    services.saveTaskFile = function(model) {
      return $http.post(constant.domain + '/task/saveTaskFile', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.getTaskBudget = function(model) {
      return $http.post(constant.resourceUrl + '/tasks/getalltaskbudgets', model);
    };

    services.addTaskBudget = function(model) {
      return $http.post(constant.resourceUrl + '/tasks/addtaskbudget', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    return services;
  }]);
  return module;
});