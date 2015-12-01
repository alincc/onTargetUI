define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = [
    '$scope',
    '$rootScope',
    '$q',
    'documentFactory',
    '$modal',
    'storage',
    '$stateParams',
    '$location',
    'onSiteFactory',
    'appConstant',
    '$filter',
    'utilFactory',
    '$sce',
    '$window',
    'notifications',
    '$state',
    'document',
    '$timeout',
    'toaster',
    'pushFactory',
    'taskFactory',
    function($scope,
             $rootScope,
             $q,
             documentFactory,
             $modal,
             storage,
             $stateParams,
             $location,
             onSiteFactory,
             appConstant,
             $filter,
             utilFactory,
             $sce,
             $window,
             notifications,
             $state,
             document,
             $timeout,
             toaster,
             pushFactory,
             taskFactory) {

      var getFileId = function() {
        if($scope.parentDocument) {
          return $scope.parentDocument.fileId;
        } else {
          return $scope.selectedDoc.fileId;
        }
      };

      var mapData = function() {
        var fileExtension = utilFactory.getFileExtension($scope.selectedDoc.filePath);
        var filePath = $filter('filePath')($scope.selectedDoc.filePath);
        $scope.selectedDoc.fullFilePath = filePath;
        if(/\.(jpeg|jpg|png)$/i.test($scope.selectedDoc.filePath)) {
          if($scope.parentDocument) {
            $scope.selectedDoc.originalFilePath = $scope.parentDocument.filePath;
          } else {
            $scope.selectedDoc.originalFilePath = $scope.selectedDoc.filePath;
          }
        }
        $scope.selectedDoc.isImage = /(png|jpg|jpeg|tiff|gif)/.test(fileExtension);
        $scope.isPdf = /(pdf$)/.test(filePath);
        $scope.isImage = /(png|jpg|jpeg|gif)/.test(fileExtension);
      };

      $scope.selectedDoc = document.currentDocument.projectFile;
      $scope.originalDoc = angular.copy(document.currentDocument.projectFile);
      $scope.versions = document.versions.reverse();
      $scope.currentVersion = _.find($scope.versions, {fileId: $scope.selectedDoc.fileId}) ?
        _.find($scope.versions, {fileId: $scope.selectedDoc.fileId}) : {versionNo: 'Original'};
      $scope.categoryId = $stateParams.categoryId;
      $scope.parseTag = function(tags) {
        _.each(tags, function(el) {
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
      };
      $scope.hideRightSide = true;
      $scope.isPreparingData = false;
      $scope.pdfImagePages = document.pdfImagePages;
      $scope.currentPageIndex = 0;
      $scope.currentPage = $scope.pdfImagePages[$scope.currentPageIndex];
      $scope.isNexting = false;
      $scope.haveNextPage = $scope.pdfImagePages.length > 1;
      $scope.havePrevPage = false;
      $scope.parentDocument = document.parentDocument ? document.parentDocument.projectFile : null;
      $scope.parseTag(document.documentTags);
      $scope.isEdit = false;
      $scope.showLinkTask = false;
      $scope.showViewTask = false;
      $scope.task = null;
      $scope.contacts = [];

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
          var currentDate = new Date().toISOString();
          onSiteFactory.addComment(getFileId(), model.comment, $scope.selectedDoc.name, $scope.selectedDoc.createdBy, currentDate)
            .success(function(resp) {
              //$scope.comments.unshift({
              //  "comment": model.comment,
              //  "commentedBy": $rootScope.currentUserInfo.userId,
              //  "commentedDate": currentDate,
              //  "commenterContact": $rootScope.currentUserInfo.contact,
              //  "projectFileCommentId": 0
              //});
              $scope.addCommentModel.comment = '';
              form.$setPristine();
              $scope.$broadcast('autosize:update');
            })
            .error(function(err) {
              console.log(err);
              form.$setPristine();
            });
        }
      };

      $scope.showHideComment = function() {
        $scope.hideRightSide = !$scope.hideRightSide;
        $scope.$broadcast('pdfTaggingMarkup.resize');
      };

      // End comments

      $scope.backToList = function() {
        $state.go("app.onSite", {categoryId: $scope.categoryId});
      };

      $scope.editDoc = function(doc) {
        $scope.isEdit = true;
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
        $scope.isEdit = false;
      };

      $scope.saveChanges = function(doc) {
        console.log($scope.versions);
        var fileName = $scope.parentDocument ? $scope.parentDocument.name : $scope.selectedDoc.name;
        var filePath = $scope.parentDocument ? $scope.parentDocument.filePath : $scope.selectedDoc.filePath;
        onSiteFactory.getNextVersionName(filePath, $scope.versions.length)
          .success(function(resp) {
            var newFilePath = resp.newVersionName;
            var data = {
              "projectId": $rootScope.currentProjectInfo.projectId,
              "name": fileName,
              "fileType": doc.fileType,
              "createdBy": $rootScope.currentUserInfo.userId,
              "modifiedBy": $rootScope.currentUserInfo.userId,
              "categoryId": doc.projectFileCategoryId.projectFileCategoryId,
              "description": doc.description,
              "parentProjectFileId": doc.parentProjectFileId === 0 ? doc.fileId : doc.parentProjectFileId,
              "isConversionComplete": true,
              "projectFileId": 0,
              "thumbnailImageName": $filter('fileThumbnail')(filePath),
              "filePath": newFilePath
            };
            documentFactory.saveUploadedDocsInfo(data)
              .then(function(resp) {
                if(resp.data && resp.data.documentDetail) {
                  var document = resp.data.documentDetail;
                  var docId = resp.data.documentDetail.fileId;
                  var listTag = [];
                  // Join tags from pages
                  _.each($scope.pdfImagePages, function(el) {
                    listTag = _.union(listTag, el.tagList);
                  });

                  // Update new doc id and existing link task for tags
                  listTag = _.map(listTag, function(el) {
                    // New document id
                    el.projectFileId = docId;
                    // Existing taskLink
                    return el;
                  });

                  console.log(listTag);

                  // Save tags to document
                  onSiteFactory.addTags(listTag)
                    .then(function() {
                      console.log($scope.pdfImagePages);
                      $state.transitionTo('app.previewDocument', {
                        docId: document.fileId,
                        categoryId: document.projectFileCategoryId.projectFileCategoryId
                      });
                      //$state.go("app.onSite");
                      //onSiteFactory.exportPdf(docId, $rootScope.currentProjectInfo.projectId, $scope.pdfImagePages);
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
          onSiteFactory.getDocumentZoomLevel($scope.parentDocument ? $scope.parentDocument.filePath : $scope.selectedDoc.filePath)
            .success(function(zooms) {
              // Update pages zoom level
              _.each($scope.pdfImagePages, function(el, idx) {
                $scope.pdfImagePages[idx].maxZoom = zooms[idx].zoomLevel;
              });
              // Check if next page first level ready
              if($scope.pdfImagePages[$scope.currentPageIndex + 1] && $scope.pdfImagePages[$scope.currentPageIndex + 1].maxZoom <= 0) {
                toaster.pop('info', 'Info', 'Sorry, the next page conversion is in progress. Please try again!');
                return;
              }
              $scope.isNexting = true;
              $scope.currentPageIndex++;
              $scope.currentPage = $scope.pdfImagePages[$scope.currentPageIndex];
              $scope.haveNextPage = $scope.currentPageIndex < $scope.pdfImagePages.length - 1;
              $scope.havePrevPage = $scope.currentPageIndex > 0;

              $timeout(function() {
                $scope.isNexting = false;
              }, 500);
            });
        }
      };

      $scope.prevPage = function() {
        if($scope.currentPageIndex > 0) {
          onSiteFactory.getDocumentZoomLevel($scope.parentDocument ? $scope.parentDocument.filePath : $scope.selectedDoc.filePath)
            .success(function(zooms) {
              // Update pages zoom level
              _.each($scope.pdfImagePages, function(el, idx) {
                $scope.pdfImagePages[idx].maxZoom = zooms[idx].zoomLevel;
              });
              $scope.$broadcast('pdfTaggingMarkUp.SavePageData');
              $scope.isNexting = true;
              $scope.currentPageIndex--;
              $scope.currentPage = $scope.pdfImagePages[$scope.currentPageIndex];
              $scope.haveNextPage = $scope.currentPageIndex < $scope.pdfImagePages.length - 1;
              $scope.havePrevPage = $scope.currentPageIndex > 0;

              $timeout(function() {
                $scope.isNexting = false;
              }, 500);
            });
        }
      };

      mapData();

      $scope.loadComment();

      // Register/UnRegister push events
      console.log('Listen event: ', 'document.preview.' + $scope.selectedDoc.fileId);
      pushFactory.bind('document.preview.' + $scope.selectedDoc.fileId, function(evt) {
        console.log('Incoming notifications: ', evt);
        if(evt.name === 'updateMaxNativeZoom') {
          $scope.$broadcast('pdfTaggingMarkup.updateTileLayer.maxNativeZoom', {
            page: evt.value.page,
            maxNativeZoom: evt.value.maxNativeZoom
          });
        }
      });

      console.log('Listen event: ', 'document.comment.' + $scope.selectedDoc.fileId);
      pushFactory.bind('document.comment.' + $scope.selectedDoc.fileId, function(evt) {
        if(evt.name === 'onSiteAddComment') {
          $scope.comments.unshift({
            "comment": evt.value.comment,
            "commentedBy": evt.value.commentedBy,
            "commentedDate": evt.value.commentedDate,
            "commenterContact": evt.value.commenterContact,
            "projectFileCommentId": 0
          });
        }
      });

      $scope.$on('pdfTaggingMarkup.Tag.LinkTask', function() {
        $scope.showLinkTask = true;
        $scope.hideRightSide = false;
        $scope.showViewTask = false;
        $scope.$broadcast('pdfTaggingMarkup.resize');
      });

      $scope.$on('pdfTaggingMarkup.Tag.UnLinkTask', function(e, dt) {
        onSiteFactory.unLinkTask(dt.projectFileTagId, dt.projectTaskId)
          .success(function(resp) {
            $rootScope.$broadcast('unLinkTask.Completed', {
              projectFileTag: {
                projectFileTagId: dt.projectFileTagId
              }
            });
            $scope.showLinkTask = false;
            $scope.showViewTask = false;
          })
          .error(function(err) {
            console.log(err);
          });
      });

      $scope.$on('pdfTaggingMarkup.popupclose', function() {
        $scope.showLinkTask = false;
        $scope.showViewTask = false;
      });

      //$scope.$on('pdfTaggingMarkup.popupopen', function(e, dt){
      //
      //});

      $scope.$on('linkTask.Completed', function() {
        $scope.showLinkTask = false;
        $scope.showViewTask = false;
      });

      $scope.$on('$destroy', function() {
        console.log('UnListen event: ', 'document.preview.' + $scope.selectedDoc.fileId);
        console.log('UnListen event: ', 'document.comment.' + $scope.selectedDoc.fileId);
        pushFactory.unbind('document.preview.' + $scope.selectedDoc.fileId);
        pushFactory.unbind('document.comment.' + $scope.selectedDoc.fileId);
      });

      // View Task
      $scope.$on('pdfTaggingMarkup.Tag.ViewTask', function(e, dt) {
        taskFactory.getTaskById(dt.taskId)
          .success(function(resp) {
            $scope.task = resp.task;
            $scope.hideRightSide = false;
            $scope.showLinkTask = false;
            $scope.showViewTask = true;
            $scope.$broadcast('pdfTaggingMarkup.resize');
          })
          .error(function(err) {
            console.log(err);
          });
      });

      $scope.actions = {
        info: {
          name: "info"
        },
        owner: {
          name: "owner"
        },
        comment: {
          name: "comment"
        },
        budget: {
          name: "budget"
        },
        progress: {
          name: "progress"
        },
        attachment: {
          name: "attachment"
        }
      };

      $scope.action = $scope.actions.info;

      $scope.openAction = function(action) {
        $scope.action = action;
      };
    }];
  return controller;
});
