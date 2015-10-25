define(function(require) {
  'use strict';
  var angular = require('angular'),
    angularLocalStorage = require('angularLocalStorage'),
    uniformLengthMeasure = require('text!app/common/resources/uniformLengthMeasure.json'),
    schema = require('text!app/common/resources/schema.json'),
    module;

  module = angular.module('common.services.onBim', [
    'app.config',
    'angularLocalStorage'
  ]);

  module.factory('onBimFactory', [
      'appConstant',
      '$http',
      '$q',
      'storage',
      function(constant,
               $http,
               $q,
               storage) {
        var service = {},
          authentication = {
            isAuth: false,
            token: '',
            data: null,
            isAllowUsersToCreateTopLevelProjects: false
          };

        service.isAuth = function() {
          return authentication.isAuth;
        };

        service.login = function() {
          var deferred = $q.defer();
          service.loadAuthentication();
          if(service.isAuth()) {
            deferred.resolve();
          } else {
            // Get token
            $http.post(constant.bimServer + '/json', {
              "request": {
                "interface": "org.buildingsmart.bimsie1.Bimsie1AuthInterface",
                "method": "login",
                "parameters": {"username": "bim@ontargetcloud.com", "password": "admin"}
              }
            })
              .success(function(resp) {
                authentication.token = resp.response.result;
                authentication.isAuth = true;
                // Get user info
                $http.post(constant.bimServer + '/json', {
                  "request": {
                    "interface": "org.bimserver.AuthInterface",
                    "method": "getLoggedInUser",
                    "parameters": {}
                  },
                  "token": authentication.token
                })
                  .success(function(resp2) {
                    authentication.data = resp2.response.result;
                    // Get permission
                    $http.post(constant.bimServer + '/json', {
                      "request": {
                        "interface": "org.bimserver.AuthInterface",
                        "method": "getLoggedInUser",
                        "parameters": {}
                      },
                      "token": authentication.token
                    })
                      .success(function(resp3) {
                        authentication.isAllowUsersToCreateTopLevelProjects = resp3.response.result;
                        storage.set('BIMAuthenticationData', authentication);
                        deferred.resolve();
                      })
                      .error(function(err) {
                        deferred.reject(err);
                      });
                  })
                  .error(function(err) {
                    deferred.reject(err);
                  });
              })
              .error(function(err) {
                authentication.token = '';
                authentication.isAuth = false;
                deferred.reject(err);
              });
          }
          return deferred.promise;
        };

        service.loadAuthentication = function() {
          var data = storage.get('BIMAuthenticationData');
          authentication = data || {};
        };

        service.getAllProjects = function(projectId) {
          return $http.post(constant.domain + '/bim/getAll', {projectId: projectId});
        };

        service.addProject = function(projectId, poid, projectBimFileLocation) {
          return $http.post(constant.domain + '/bim/save', {
            "projectId" : projectId,
            "poid" : poid,
            "projectBimFileLocation" : projectBimFileLocation
          });
        };

        service.addComment = function(projectBIMFileId, comment) {
          return $http.post(constant.domain + '/bim/comment/save', {
            projectBIMFileId: projectBIMFileId,
            comment: comment
          });
        };

        service.updateComment = function(projectBIMFileId, comment, commentId) {
          return $http.post(constant.domain + '/bim/comment/save', {
            projectBIMFileId: projectBIMFileId,
            comment: comment,
            commentId: commentId
          });
        };

        service.getCommentList = function(projectBIMFileId) {
          return $http.post(constant.domain + '/bim/comment/list', {
            projectBIMFileId: projectBIMFileId
          });
        };

        service.deleteComment = function(commentId) {
          return $http.post(constant.domain + '/bim/comment/delete', {
            commentId: commentId
          });
        };

        service.getBimProjectList = function() {
          return $http.post(constant.bimServer + '/json', {
            "request": {
              "interface": "org.buildingsmart.bimsie1.Bimsie1ServiceInterface",
              "method": "getAllProjectsSmall",
              "parameters": {}
            },
            "token": authentication.token
          });
        };

        service.getBimProjectByPoid = function(poid) {
          return $http.post(constant.bimServer + '/json', {
            "request": {
              "interface": "org.buildingsmart.bimsie1.Bimsie1ServiceInterface",
              "method": "getProjectByPoid",
              "parameters": {
                poid: poid
              }
            },
            "token": authentication.token
          });
        };

        service.addBimProject = function (projectName, schema){
          return $http.post(constant.bimServer + '/json', {
            "request": {
              "interface": "org.buildingsmart.bimsie1.Bimsie1ServiceInterface",
              "method": "addProject",
              "parameters": {
                projectName: projectName,
                schema: schema
              }
            },
            "token": authentication.token
          });
        };

        service.updateBimProject = function (sProject){
          return $http.post(constant.bimServer + '/json', {
            "request": {
              "interface":"org.bimserver.ServiceInterface",
              "method":"updateProject",
              "parameters": {
                sProject: sProject
              }
            },
            "token": authentication.token
          });
        };

        service.getAllBimRelatedProject = function (poid){
          return $http.post(constant.bimServer + '/json', {
            "request": {
              "interface":"org.bimserver.ServiceInterface",
              "method":"getAllRelatedProjects",
              "parameters": {
                poid: poid
              }
            },
            "token": authentication.token
          });
        };

        service.getUniformLengthMeasure = function (){
          return angular.fromJson(uniformLengthMeasure);
        };

        service.getSchema = function (){
          return angular.fromJson(schema);
        };

        return service;
      }]
  );
  return module;
});
