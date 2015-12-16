define(function (require){
  'use strict';
  var angular = require('angular'),
    userContext = require('app/common/context/user'),
    taskStatuses = require('text!app/common/resources/taskStatuses.json'),
    taskSeverities = require('text!app/common/resources/taskSeverities.json'),
    config = require('app/config');
  var module = angular.module('common.services.task', ['app.config', 'common.context.user']);
  module.factory('taskFactory', ['$http', 'appConstant', '$q', 'userContext', function ($http, constant, $q, userContext){
    var services = {};

    //project task
    services.getProjectTasks = function (projectId, canceler){
      canceler = canceler || $q.defer();
      return $http.post(constant.domain + '/task/getProjectTaskByMainProject', {
        projectId: projectId
      }, {
        timeout: canceler.promise
      });
    };

    services.getProjectTaskByActivity = function (projectId, canceler){
      canceler = canceler || $q.defer();
      return $http.post(constant.domain + '/task/getProjectTaskByActivity', {
        projectId: projectId
      }, {
        timeout: canceler.promise
      });
    };

    services.getTaskById = function (taskId, canceler){
      canceler = canceler || $q.defer();
      return $http.post(constant.domain + '/task/getTaskDetail', {
        taskId: taskId
      }, {
        timeout: canceler.promise
      });
    };

    services.addTask = function (model){
      return $http.post(constant.domain + '/task/addTask', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.updateTask = function (model){
      return $http.post(constant.domain + '/task/addTask', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.deleteTask = function (taskId){
      return $http.post(constant.domain + '/task/deleteTask', {
        taskId: taskId
      }, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.getContacts = function (projectId){
      return $http.post(constant.domain + '/project/getProjectMembers', {
        projectId: projectId
      });
    };

    services.getTaskStatuses = function (){
      return angular.fromJson(taskStatuses);
    };

    services.getTaskSeverities = function (){
      return angular.fromJson(taskSeverities);
    };

    services.assignUserToTask = function (model){
      return $http.post(constant.domain + '/task/assignUserToTask', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.createNewComment = function (model){
      return $http.post(constant.domain + '/task/addComment', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.createTaskPercentage = function (model){
      return $http.post(constant.domain + '/task/percentage/add', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.updateTaskPercentage = function (model){
      return $http.post(constant.domain + '/task/percentage/update', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.getTaskAttachments = function (model){
      return $http.post(constant.domain + '/task/getTaskAttachments', model);
    };

    services.saveTaskFile = function (model){
      return $http.post(constant.domain + '/task/saveTaskFile', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.getTaskBudget = function (taskId){
      return $http.post(constant.domain + '/task/budget/getTaskBudgetByTaskId', {
        taskId: taskId
      });
    };

    services.addTaskBudget = function (data){
      return $http.post(constant.domain + '/task/budget/add', {taskBudgetEstimates: data}, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.updateTaskBudget = function (data){
      return $http.post(constant.domain + '/task/budget/add', {taskBudgetEstimates: data}, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.deletedTaskAttachment = function (taskFileId){
      var data = {
        taskFileId: taskFileId
      };

      return $http.post(constant.domain + '/task/deleteTaskAttachment', data, {
          headers: {
            AutoAlert: true
          }
        }
      )
        ;
    };

    return services;
  }]);
  return module;
});