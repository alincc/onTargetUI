define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', 'documentFactory', '$modal', 'storage', '$stateParams', '$location', 'onSiteFactory', 'appConstant', '$filter', 'utilFactory', '$sce', '$window', 'notifications', '$state', 'document', '$timeout',
    function($scope, $rootScope, $q, documentFactory, $modal, storage, $stateParams, $location, onSiteFactory, appConstant, $filter, utilFactory, $sce, $window, notifications, $state, document, $timeout) {
      $scope.selectedDoc = document.projectFile;
      $scope.originalDoc = angular.copy(document.projectFile);
      $scope.versions = document.versions.reverse();
      $scope.parentDocument = document.parentDocument;
      $scope.currentVersion = _.find($scope.versions, {fileId: $scope.selectedDoc.fileId}) ?
        _.find($scope.versions, {fileId: $scope.selectedDoc.fileId}) : {versionNo: 'Origin'};

      function getFileId() {
        if($scope.selectedDoc.versionProjectFiles.length > 0) {
          return $scope.selectedDoc.versionProjectFiles[0].fileId;
        } else {
          return $scope.selectedDoc.fileId;
        }
      }

      $scope.onAction = $stateParams.onAction;
      $scope.pdfImagePages = _.map(document.pages, function(el) {
        return {
          imagePath: el
        };
      });
      $scope.currentPageIndex = 0;
      $scope.currentPage = $scope.pdfImagePages[$scope.currentPageIndex];
      $scope.isNexting = false;
      $scope.haveNextPage = $scope.pdfImagePages.length > 1;
      $scope.havePrevPage = false;

      var mapData = function() {
        var fileExtension = utilFactory.getFileExtension($scope.selectedDoc.filePath);
        var filePath = $filter('filePath')($scope.selectedDoc.filePath);
        $scope.selectedDoc.fullFilePath = filePath;
        console.log($scope.parentDocument, /\.(jpeg|jpg|png)$/i.test($scope.selectedDoc.filePath));
        if(/\.(jpeg|jpg|png)$/i.test($scope.selectedDoc.filePath)) {
          if($scope.parentDocument) {
            $scope.selectedDoc.originalFilePath = $scope.parentDocument.filePath;
          } else {
            $scope.selectedDoc.originalFilePath = $scope.selectedDoc.filePath;
          }
        }
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
        if($scope.selectedDoc.versionProjectFiles) {
          onSiteFactory.getFileComment(getFileId())
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
        }
      };

      $scope.addComment = function(model, form) {
        if($scope.selectedDoc) {
          onSiteFactory.addComment(getFileId(), model.comment, $scope.selectedDoc.name, $scope.selectedDoc.createdBy)
            .success(function(resp) {
              $scope.comments.unshift({
                "comment": model.comment,
                "commentedBy": $rootScope.currentUserInfo.userId,
                "commentedDate": new Date().toISOString(),
                "commenterContact": $rootScope.currentUserInfo.contact,
                "projectFileCommentId": 0
              });
              $scope.addCommentModel.comment = '';
              form.$setPristine();
              $scope.$broadcast('autosize:update');
            })
            .error(function(err) {
              console.log(err);
            });
        }
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

      $scope.backToList = function() {
        if($scope.onAction === 'onSite') {
          $state.go("app.onSite");
        }
        else {
          window.history.back();
        }
      };

      $scope.editDoc = function(doc) {
        onSiteFactory.getDocumentTags(doc.fileId).then(function(resp) {
          _.each(resp.data.tags, function(el) {
            var pageNumber = /.*\|\sPage\-(\d+)/.exec(el.title)[1];
            if(angular.isDefined(pageNumber) && pageNumber !== null) {
              pageNumber = parseInt(pageNumber);
              if($scope.pdfImagePages[pageNumber - 1]) {
                if(!$scope.pdfImagePages[pageNumber - 1].tagList) {
                  $scope.pdfImagePages[pageNumber - 1].tagList = [];
                }
                $scope.pdfImagePages[pageNumber - 1].tagList.push(el);
              }
            }
          });
          $scope.showDocPreview = true;
        });
      };

      $scope.cancelEdit = function() {
        _.each($scope.pdfImagePages, function(el) {
          delete el.tagList;
          delete el.layers;
          delete el.width;
          delete el.height;
          delete el.scale;
          delete el.tagList;
        });
        $scope.showDocPreview = false;
      };

      $scope.saveChanges = function(doc) {
        onSiteFactory.getNextVersionName($scope.selectedDoc.filePath)
          .success(function(resp) {
            var newFilePath = resp.newVersionName;
            var newFileName = newFilePath.substring(newFilePath.lastIndexOf('/') + 1);
            var data = {
              "projectId": $rootScope.currentProjectInfo.projectId,
              "name": $filter('fileName')(newFilePath),
              "fileType": doc.fileType,
              "createdBy": $rootScope.currentUserInfo.userId,
              "modifiedBy": $rootScope.currentUserInfo.userId,
              "categoryId": doc.projectFileCategoryId.projectFileCategoryId,
              "description": doc.description,
              "parentProjectFileId": doc.parentProjectFileId === 0 ? doc.fileId : doc.parentProjectFileId,
              "isConversionComplete": false,
              "projectFileId": 0,
              "thumbnailImageName": $filter('fileThumbnail')(newFilePath),
              "filePath": newFilePath
            };
            documentFactory.saveUploadedDocsInfo(data).then(function(resp) {
              if(resp.data && resp.data.documentDetail) {
                var docId = resp.data.documentDetail.fileId;
                var listTag = [];

                // Join tags from pages
                _.each($scope.pdfImagePages, function(el) {
                  listTag = _.union(listTag, el.tagList);
                });
                console.log(listTag, docId);
                // Update new doc id for tags
                listTag = _.map(listTag, function(el) {
                  el.projectFileId = docId;
                  return el;
                });

                // Save tags to document
                onSiteFactory.addTags(listTag).then(function(resp) {
                  $state.go("app.onSite");
                  onSiteFactory.exportPdf(docId, $rootScope.currentProjectInfo.projectId, $scope.pdfImagePages);
                }, function(err) {
                  console.log(err);
                  $scope._form.$setPristine();
                });

                //scope.addTag(listTag).then(function(resp) {
                //  scope.$emit('pdfTaggingMarkUp.SaveDone');
                //  scope.exportPdf(docId, newFileName, width, height);
                //}, function(err) {
                //  console.log(err);
                //  scope.$emit('pdfTaggingMarkUp.SaveError', {error: err});
                //});
              }
            }, function(err) {
              console.log(err);
              $scope._form.$setPristine();
            });
          })
          .error(function(err) {
            console.log(err);
            $scope._form.$setPristine();
          });
      };

      $scope.backToAttachments = function() {
        var activity = $rootScope.activitySelected || {};
        var task = $rootScope.currentTask || {};
        $rootScope.backtoAttachments = true;
        $state.transitionTo('app.onTime', {activityId: activity.projectId, taskId: task.projectTaskId});
      };

      $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
      };

      $scope.selectVersion = function(version) {
        if(version) {
          $location.search('docId', version.fileId);
        }
        else {
          if($scope.selectedDoc.parentProjectFileId !== 0) {
            $location.search('docId', $scope.selectedDoc.parentProjectFileId);
          }
        }
      };

      $scope.status = {
        isopen: false
      };

      $scope.toggleDropdown = function() {
        $scope.status.isopen = !$scope.status.isopen;
      };

      $scope.nextPage = function() {
        if($scope.currentPageIndex < $scope.pdfImagePages.length - 1) {
          $scope.isNexting = true;
          $scope.currentPageIndex++;
          $scope.currentPage = $scope.pdfImagePages[$scope.currentPageIndex];
          $scope.haveNextPage = $scope.currentPageIndex < $scope.pdfImagePages.length - 1;
          $scope.havePrevPage = $scope.currentPageIndex > 0;
          $timeout(function() {
            $scope.isNexting = false;
          }, 500);
        }
      };

      $scope.prevPage = function() {
        if($scope.currentPageIndex > 0) {
          $scope.$broadcast('pdfTaggingMarkUp.SavePageData');
          $scope.isNexting = true;
          $scope.currentPageIndex--;
          $scope.currentPage = $scope.pdfImagePages[$scope.currentPageIndex];
          $scope.haveNextPage = $scope.currentPageIndex < $scope.pdfImagePages.length - 1;
          $scope.havePrevPage = $scope.currentPageIndex > 0;
          $timeout(function() {
            $scope.isNexting = false;
          }, 500);
        }
      };

      mapData();

      if($scope.onAction === 'onSite') {
        $scope.loadComment();
      }
    }];
  return controller;
});
