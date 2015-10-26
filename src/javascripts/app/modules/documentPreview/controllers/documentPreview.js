define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', 'documentFactory', '$modal', 'storage', '$stateParams', '$location', 'onSiteFactory', 'appConstant', '$filter', 'utilFactory', '$sce', '$window', 'notifications', '$state', 'document', '$http',
    function($scope, $rootScope, $q, documentFactory, $modal, storage, $stateParams, $location, onSiteFactory, appConstant, $filter, utilFactory, $sce, $window, notifications, $state, document, $http) {
      $scope.selectedDoc = document.projectFile;
      $scope.onAction = $stateParams.onAction;

      var mapData = function() {
        var fileExtension = utilFactory.getFileExtension($scope.selectedDoc.name);
        var filePath = $filter('filePath')($scope.selectedDoc.name);
        $scope.selectedDoc.filePath = filePath;
        $scope.selectedDoc.isImage = /(png|jpg|jpeg|tiff|gif)/.test(fileExtension);
        $scope.docImagePath = document.imagePath;
        $scope.isPdf = /(pdf$)/.test(filePath);
        $scope.isImage = /(png|jpg|jpeg|gif)/.test(fileExtension);
      };

      // Comments
      $scope.comments = [];

      $scope.isLoadingComment = false;

      $scope.addCommentModel = {
        comment: ''
      };

      $scope.loadComment = function() {
        $scope.isLoadingComment = true;
        onSiteFactory.getFileComment($scope.selectedDoc.fileId)
          .success(function(resp) {
            $scope.comments = resp.comments;
            // update scroll
            $scope.$broadcast('content.reload');
            $scope.isLoadingComment = false;
          })
          .error(function(err) {
            console.log(err);
            $scope.isLoadingComment = false;
          });
      };

      $scope.addComment = function(model, form) {
        if($scope.selectedDoc) {
          onSiteFactory.addComment($scope.selectedDoc.fileId, model.comment, $scope.selectedDoc.name, $scope.selectedDoc.createdBy)
            .success(function(resp) {
              //$scope.comments.unshift({
              //  "comment": model.comment,
              //  "commentedBy": $rootScope.currentUserInfo.userId,
              //  "commentedDate": new Date().toISOString(),
              //  "commenterContact": $rootScope.currentUserInfo.contact,
              //  "projectFileCommentId": 0
              //});
              //$scope.addCommentModel.comment = '';
              //form.$setPristine();
              //$scope.$broadcast('autosize:update');
            })
            .error(function(err) {
              console.log(err);
            });
        }
      };

      $scope.addCommentToServer = function(objPost) {
        return $http.post(appConstant.domain + '/project/file/tag/comment/add', objPost);
      };

      $scope.addTag = function(tags) {
        return $http.post(appConstant.domain + '/project/file/tag/save', {
          tags: tags
        });
      };

      $scope.extractListComment = function(doc) {
        return _.reduce(doc.listLayer, function(memo, m) {
          if(m.type === 'marker' && m.comments && m.comments.length) {
            if(!memo) {
              memo = [];
            }
            _.each(m.comments, function(comment) {
              memo.push({
                comment: comment.text,
                projectFileTagId: doc.fileId
              });
            });
            return memo;
          }
        }, []);
      };

      $scope.extractListTags = function(doc) {
        return _.map(doc.listLayer, function(m) {
          if(m.type === 'marker') {
            return {
              'projectFileId': doc.fileId,
              'projectFileTagId': null,
              'parentFileTagId': null,
              'tag': '',
              'title': '',
              'lattitude': m.layer.getLatLng().lat,
              'longitude': m.layer.getLatLng().lng,
              'tagType': 'TAG',
              'tagFilePath': '',
              'status': null,
              'addedBy': $rootScope.currentUserInfo.userId,
              'addedDate': new Date().toISOString(),
              'attributes': [
                {
                  key: 'type',
                  value: 'marker',
                  'projectFileTagAttributeId': null
                },
                {
                  key: 'geo.0.0',
                  value: m.layer.getLatLng().lat,
                  'projectFileTagAttributeId': null
                },
                {
                  key: 'geo.0.1',
                  value: m.layer.getLatLng().lng,
                  'projectFileTagAttributeId': null
                }
              ]
            };
          }
          var attr = [];
          _.each(m.options, function(v, k) {
            if(v) {
              attr.push({
                key: 'options.' + k,
                value: v,
                'projectFileTagAttributeId': null
              });
            }
          });
          if(m.type !== 'polyline') {
            if(m.geometry.coordinates[0].length) {
              _.each(m.geometry.coordinates[0], function(coo, k) {
                attr.push({
                  key: 'geo.' + k + '.1',
                  value: coo[0],
                  'projectFileTagAttributeId': null
                });
                attr.push({
                  key: 'geo.' + k + '.0',
                  value: coo[1],
                  'projectFileTagAttributeId': null
                });
              });
            } else {
              attr.push({
                key: 'geo.0.0',
                value: m.geometry.coordinates[1],
                'projectFileTagAttributeId': null
              });
              attr.push({
                key: 'geo.0.1',
                value: m.geometry.coordinates[0],
                'projectFileTagAttributeId': null
              });
            }
          } else {
            _.each(m.geometry.coordinates, function(c, k) {
              attr.push({
                key: 'geo.' + k + '.0',
                value: c[1],
                'projectFileTagAttributeId': null
              });
              attr.push({
                key: 'geo.' + k + '.1',
                value: c[0],
                'projectFileTagAttributeId': null
              });
            });
          }


          attr.push({
            key: '_mRadius',
            value: m._mRadius || 0,
            'projectFileTagAttributeId': null
          });
          attr.push({
            key: 'radius',
            value: m.r || 0,
            'projectFileTagAttributeId': null
          });
          attr.push({
            key: 'type',
            value: m.type,
            'projectFileTagAttributeId': null
          });
          return {
            'projectFileId': doc.fileId,
            'projectFileTagId': null,
            'parentFileTagId': null,
            'tag': '',
            'title': '',
            'tagType': 'TAG',
            'tagFilePath': '',
            'status': null,
            'addedBy': $rootScope.currentUserInfo.userId,
            'addedDate': new Date().toISOString(),
            attributes: attr
            //'attributes': [
            //  //{
            //  //  'key': '_mRadius',
            //  //  'value': m._mRadius,
            //  //  'projectFileTagAttributeId': null
            //  //},
            //  //{
            //  //  'key': 'geometry',
            //  //  'value': JSON.stringify(m.geometry),
            //  //  'projectFileTagAttributeId': null
            //  //}, {
            //  //  'key': 'options',
            //  //  'value': JSON.stringify(m.options),
            //  //  'projectFileTagAttributeId': null
            //  //},
            //  //{
            //  //  key: 'type',
            //  //  value: m.type,
            //  //  'projectFileTagAttributeId': null
            //  //},
            //  //{
            //  //  key: 'latlng',
            //  //  value: JSON.stringify(m.layer.getLatLngs()),
            //  //  'projectFileTagAttributeId': null
            //  //}
            //]
          };
        });
      };

      $scope.getProjectFileTagId = function(id) {
        return $http.post(appConstant.domain + '/project/file/tag/get', {
          "projectFileId": id
        });
      };

      $scope.backToList = function() {
        if($scope.onAction === 'onSite') {
          $state.go("app.onSite");
        }
        else {
          window.history.back();
        }
      };

      $scope.editDoc = function(doc) {
        $scope.getProjectFileTagId(doc.fileId).then(function(resp) {
          $rootScope.pdfTaggingMarkUpEditData = resp.data.tags;
          $scope.showDocPreview = true;
        });
      };

      $scope.cancelEdit = function() {
        $scope.showDocPreview = false;
      };

      $scope.saveDoc = function(doc) {
        $scope.$broadcast('pdfTaggingMarkUp.SaveTheDoc', {doc: doc});
      };

      $scope.$on('pdfTaggingMarkUp.SaveDone', function(e, dt) {
        //$scope.selectedDoc.filePath = $filter('filePath')(dt);
        //$scope.showDocPreview = false;
        //$scope._form.$setPristine();
        $location.search('docId', dt.docId);
      });

      $scope.backToAttachments = function() {
        var activity = $rootScope.activitySelected || {};
        var task = $rootScope.currentTask || {};
        $rootScope.backtoAttachments = true;
        $state.transitionTo('app.onTime', {activityId: activity.projectId, taskId: task.projectTaskId});
      };

      $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
      };

      mapData();

      if($scope.onAction === 'onSite') {
        $scope.loadComment();
      }
    }];
  return controller;
});
