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
      'Upload',
      function(constant,
               $http,
               $q,
               storage,
               Upload) {
        var service = {},
          authentication = {
            isAuth: false,
            token: '',
            data: null,
            isAllowUsersToCreateTopLevelProjects: false
          };

        service.isAuth = function() {
          return authentication.isAuth && authentication.token !== '';
        };

        service.login = function() {
          var deferred = $q.defer();
          //service.loadAuthentication();
          if(service.isAuth()) {
            deferred.resolve();
          } else {
            // Get token
            $http.post(constant.bimServer + '/json', {
                "request": {
                  "interface": "org.buildingsmart.bimsie1.Bimsie1AuthInterface",
                  "method": "login",
                  "parameters": {"username": constant.bim_user, "password": constant.bim_password}
                }
              },
              {
                headers: {
                  Authorization: false
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
                  },
                  {
                    headers: {
                      Authorization: false
                    }
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
                      },
                      {
                        headers: {
                          Authorization: false
                        }
                      })
                      .success(function(resp3) {
                        authentication.isAllowUsersToCreateTopLevelProjects = resp3.response.result;
                        storage.set("bimToken", authentication.token);
                        //storage.set('BIMAuthenticationData', authentication);
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
          //var data = storage.get('BIMAuthenticationData');
          authentication = {};
        };

        service.getAllProjects = function(projectId) {
          return $http.post(constant.domain + '/bim/getAll', {projectId: projectId});
        };

        service.addProject = function(data) {
          return $http.post(constant.domain + '/bim/save', data);
        };

        service.uploadIfc = function(file, projectAssetFolderName, data, newFileName) {
          newFileName = newFileName || file.name;
          return Upload.upload({
            url: constant.newBimServer + '/bim/upload',
            file: file,
            fields: {
              'fileName': newFileName,
              'data': data,
              'projectAssetFolderName': projectAssetFolderName
            },
            headers: {
              'Authorization': false
            }
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
            },
            {
              headers: {
                Authorization: false
              }
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
            },
            {
              headers: {
                Authorization: false
              }
            });
        };

        service.addBimProject = function(projectName, schema) {
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
            },
            {
              headers: {
                Authorization: false
              }
            });
        };

        service.deleteProject = function(projectId) {
          return $http.post(constant.domain + '/bim/delete', {
            projectBimFileId: projectId
          }, {
            headers: {
              AutoAlert: true
            }
          });
        };

        service.deleteBimProject = function(poid) {
          return $http.post(constant.bimServer + '/json', {
              "request": {
                "interface": "org.buildingsmart.bimsie1.Bimsie1ServiceInterface",
                "method": "deleteProject",
                "parameters": {
                  poid: poid
                }
              },
              "token": authentication.token
            },
            {
              headers: {
                Authorization: false
              }
            });
        };

        service.updateBimProject = function(sProject) {
          return $http.post(constant.bimServer + '/json', {
              "request": {
                "interface": "org.bimserver.ServiceInterface",
                "method": "updateProject",
                "parameters": {
                  sProject: sProject
                }
              },
              "token": authentication.token
            },
            {
              headers: {
                Authorization: false
              }
            });
        };

        service.getAllBimRelatedProject = function(poid) {
          return $http.post(constant.bimServer + '/json', {
              "request": {
                "interface": "org.bimserver.ServiceInterface",
                "method": "getAllRelatedProjects",
                "parameters": {
                  poid: poid
                }
              },
              "token": authentication.token
            },
            {
              headers: {
                Authorization: false
              }
            });
        };

        service.getUniformLengthMeasure = function() {
          return angular.fromJson(uniformLengthMeasure);
        };

        service.getSchema = function() {
          return angular.fromJson(schema);
        };

        service.getSerializerByPluginClassName = function() {
          return $http.post(constant.bimServer + '/json', {
              "request": {
                "interface": "org.bimserver.PluginInterface",
                "method": "getSerializerByPluginClassName",
                "parameters": {
                  pluginClassName: "org.bimserver.serializers.JsonSerializerPlugin"
                }
              },
              "token": authentication.token
            },
            {
              headers: {
                Authorization: false
              }
            });
        };

        service.downloadByJsonQuery = function(jsonQuery, roids, serializerOid) {
          return $http.post(constant.bimServer + '/json', {
              "request": {
                "interface": "org.buildingsmart.bimsie1.Bimsie1ServiceInterface",
                "method": "downloadByJsonQuery",
                "parameters": {
                  jsonQuery: jsonQuery,
                  roids: roids,
                  serializerOid: serializerOid,
                  sync: true
                }
              },
              "token": authentication.token
            },
            {
              headers: {
                Authorization: false
              }
            });
        };

        service.generateRevisionDownloadUrl = function(longActionId, serializerOid, topicId) {
          return $http.get(constant.bimServer + '/download?token=' + authentication.token + '&longActionId=' + longActionId + '&serializerOid=' + serializerOid + '&topicId=' + topicId);
        };

        service.downloadByTypes = function(roid, type, jsonSerializerOid) {
          return $http.post(constant.bimServer + '/json', {
              "request": {
                "interface": "org.buildingsmart.bimsie1.Bimsie1ServiceInterface",
                "method": "downloadByTypes",
                "parameters": {
                  roids: [roid],
                  classNames: [type],
                  schema: "ifc2x3tc1",
                  includeAllSubtypes: true,
                  serializerOid: jsonSerializerOid,
                  useObjectIDM: false,
                  deep: false,
                  sync: true
                }
              },
              "token": authentication.token
            },
            {
              headers: {
                Authorization: false
              }
            });
        };

        service.cleanupLongAction = function(laid) {
          return $http.post(constant.bimServer + '/json', {
              "request": {
                "interface": "org.bimserver.ServiceInterface",
                "method": "cleanupLongAction",
                "parameters": {
                  actionId: laid
                }
              },
              "token": authentication.token
            },
            {
              headers: {
                Authorization: false
              }
            });
        };

        service.updateProject = function(data) {
          return $http.post(constant.domain + '/bim/save', data);
        };

        service.getById = function(id) {
          return $http.post(constant.domain + '/bim/get', {
            "projectBimFileId": id
          });
        };

        return service;
      }]
  );
  return module;
});
