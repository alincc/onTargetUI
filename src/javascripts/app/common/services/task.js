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
    // get tasks
    /*services.getTasks = function (){
     return $http.get(constant.domain + '/api/tasks');
     };

     // get tasks
     services.getById = function (id){
     return $http.get(constant.domain + '/api/tasks/' + id);
     };

     // create task
     services.createTask = function (args){
     var userId = userContext.authentication().userData.id;
     return $http.post(constant.domain + '/api/users/' + userId + '/tasks', args);
     };

     // update task
     services.updateTask = function (taskId, data){
     return $http.put(constant.domain + '/api/tasks/' + taskId, data);
     };

     // update task
     services.updateTaskState = function (taskId, state){
     return $http.patch(constant.domain + '/api/tasks/' + taskId + '/state', {state: state});
     };

     services.getTasksByUser = function (userId){
     return $http.get(constant.domain + '/api/users/' + userId + '/tasks');
     };

     services.reassign = function (taskId, to){
     return $http.post(constant.domain + 'api/Tasks/' + taskId + '/reassign', {
     to: to
     });
     };*/

    //project task
    services.getProjectTasks = function(model, canceler) {
      //return $http.post(constant.domain + '/task/getProjectTask', model);
      return $http.post(constant.resourceUrl + '/tasks/getProjectTasks', model, {
        timeout: canceler.promise
      });
    };

    services.addTask = function(model) {
      //return $http.post(constant.domain + '/task/addTask', model);
      return $http.post(constant.resourceUrl + '/task/createnewtask', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.updateTask = function(model) {
      return $http.post(constant.resourceUrl + '/task/createnewtask', model, {
        headers: {
          AutoAlert: true
        }
      });
    };

    services.deleteTask = function(model) {
      //return $http.post(constant.domain + '/task/deleteTask', model);
      return $http.post(constant.resourceUrl + '/tasks/deleteTask', model, {
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

    services.assignUserToTask = function (model){
      //return $http.post(constant.domain + '/task/assignUserToTask', model);
      return $http.post(constant.resourceUrl + '/contact/setTaskMember/', model);
    };

    services.createNewComment = function (model){
      return $http.post(constant.resourceUrl + '/task/createnewtaskcomment', model);
    };

    services.updateProgress = function (model){
      return $http.post(constant.resourceUrl + '/tasks/createnewtaskpercentage', model);
    };

    services.getTaskAttachments = function (model){
      return $http.post(constant.resourceUrl + '/tasks/getTaskAttachments', model);
    };

    services.saveTaskFile = function (model){
      return $http.post(constant.resourceUrl + '/ask/saveTaskFile', model);
    };

    return services;
  }]);
  return module;
});