define(function (require){
  'use strict';
  var angular = require('angular'),
    userContext = require('app/common/context/user'),
    config = require('app/config');
  var module = angular.module('common.services.task', ['app.config', 'common.context.user']);
  module.factory('taskFactory', ['$http', 'appConstant', '$q', 'userContext', function ($http, constant, $q, userContext){
    var services = {};
    // get tasks
    services.getTasks = function (){
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
    };

    return services;
  }]);
  return module;
});