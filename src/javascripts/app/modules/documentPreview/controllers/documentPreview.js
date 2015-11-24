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
    'fileFactory',
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
             fileFactory) {

      var getFileId = function() {
        if($scope.selectedDoc.versionProjectFiles.length > 0) {
          return $scope.selectedDoc.versionProjectFiles[0].fileId;
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

      $scope.selectedDoc = document.projectFile;
      $scope.originalDoc = angular.copy(document.projectFile);
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
      $scope.showDocPreview = false;
      $scope.maxNativeZoom = null;
      $scope.hideComments = true;
      $scope.isPreparingData = false;

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
        $scope.hideComments = !$scope.hideComments;
        $scope.$broadcast('documentPreview.showHideComment', $scope.hideComments);
      };

      // End comments

      $scope.backToList = function() {
        $state.go("app.onSite", {categoryId: $scope.categoryId});
      };

      $scope.editDoc = function(doc) {
        $scope.isPreparingData = true;
        // Check file status
        onSiteFactory.checkFileStatus($scope.selectedDoc.filePath)
          .success(function(stt) {
            if(stt.status === "UnProceeded") {
              // Update document conversion status
              onSiteFactory.updateDocumentConversionStatus($scope.selectedDoc.fileId, false)
                .success(function() {
                  // Start conversion progress
                  fileFactory.convertPDFToImage($scope.selectedDoc.filePath, $scope.selectedDoc.fileId)
                    .then(function() {
                      toaster.pop('info', 'Info', 'PDF file conversion is in progress. Please try again!');
                    });
                  $scope.isPreparingData = false;
                })
                .error(function(err) {
                  console.log("Update document status failed!", err);
                  $scope.isPreparingData = false;
                });
            } else {
              if($scope.isPdf) {
                // Original
                if($scope.selectedDoc.parentProjectFileId === 0) {
                  // Get pdf images
                  onSiteFactory.getPdfImagePages($scope.selectedDoc.filePath)
                    .success(function(p) {
                      if(p.pages.length === 0) {
                        $scope.isPreparingData = false;
                        toaster.pop('error', 'Error', 'Cannot found any images for this file!');
                      }
                      else {
                        // Get document zoom level
                        onSiteFactory.getDocumentZoomLevel($scope.selectedDoc.filePath)
                          .success(function(zooms) {
                            if(zooms.length > 0) {
                              // Get document tags
                              onSiteFactory.getDocumentTags($scope.selectedDoc.fileId)
                                .success(function(documentTag) {
                                  $scope.pdfImagePages = _.map(p.pages, function(el, idx) {
                                    return {
                                      imagePath: el,
                                      maxZoom: zooms[idx].zoomLevel
                                    };
                                  });
                                  $scope.currentPageIndex = 0;
                                  $scope.currentPage = $scope.pdfImagePages[$scope.currentPageIndex];
                                  $scope.isNexting = false;
                                  $scope.haveNextPage = $scope.pdfImagePages.length > 1;
                                  $scope.havePrevPage = false;
                                  $scope.parentDocument = null;
                                  $scope.parseTag(documentTag.tags);
                                  $scope.showDocPreview = true;
                                  $scope.isPreparingData = false;
                                })
                                .error(function(err) {
                                  console.log(err);
                                  $scope.isPreparingData = false;
                                  toaster.pop('error', 'Error', 'Get document tags failed');
                                });
                            } else {
                              $scope.isPreparingData = false;
                              toaster.pop('info', 'Info', 'PDF file conversion is in progress. Please try again!');
                            }
                          })
                          .error(function() {
                            $scope.isPreparingData = false;
                            toaster.pop('info', 'Info', 'PDF file conversion is in progress. Please try again!');
                          });
                      }
                    })
                    .error(function(err) {
                      $scope.isPreparingData = false;
                      toaster.pop('error', 'Error', 'Get pdf images failed');
                    });
                }
                else {
                  // Version
                  documentFactory.getDocumentDetail({
                    projectId: $rootScope.currentProjectInfo.projectId,
                    projectFileId: $scope.selectedDoc.parentProjectFileId
                  })
                    .success(function(parentDocument) {
                      // Get pdf images
                      onSiteFactory.getPdfImagePages(parentDocument.projectFile.filePath)
                        .success(function(p) {
                          if(p.pages.length === 0) {
                            $scope.isPreparingData = false;
                            toaster.pop('error', 'Error', 'Cannot found any images for this file!');
                          }
                          else {
                            // Get document zoom level
                            onSiteFactory.getDocumentZoomLevel(parentDocument.projectFile.filePath)
                              .success(function(zooms) {
                                if(zooms.length > 0) {
                                  // Get document tags
                                  onSiteFactory.getDocumentTags($scope.selectedDoc.fileId)
                                    .success(function(documentTag) {
                                      $scope.pdfImagePages = _.map(p.pages, function(el, idx) {
                                        return {
                                          imagePath: el,
                                          maxZoom: zooms[idx].zoomLevel
                                        };
                                      });
                                      $scope.currentPageIndex = 0;
                                      $scope.currentPage = $scope.pdfImagePages[$scope.currentPageIndex];
                                      $scope.isNexting = false;
                                      $scope.haveNextPage = $scope.pdfImagePages.length > 1;
                                      $scope.havePrevPage = false;
                                      $scope.parentDocument = parentDocument.projectFile;
                                      $scope.parseTag(documentTag.tags);
                                      $scope.showDocPreview = true;
                                      $scope.isPreparingData = false;
                                    })
                                    .error(function(err) {
                                      console.log(err);
                                      $scope.isPreparingData = false;
                                      toaster.pop('error', 'Error', 'Get document tags failed');
                                    });
                                } else {
                                  $scope.isPreparingData = false;
                                  toaster.pop('info', 'Info', 'PDF file conversion is in progress. Please try again!');
                                }
                              })
                              .error(function() {
                                $scope.isPreparingData = false;
                                toaster.pop('info', 'Info', 'PDF file conversion is in progress. Please try again!');
                              });
                          }
                        })
                        .error(function(err) {
                          $scope.isPreparingData = false;
                          toaster.pop('error', 'Error', 'Get pdf images failed');
                        });
                    })
                    .error(function(err) {
                      $scope.isPreparingData = false;
                      toaster.pop('error', 'Error', 'Get document details failed');
                    });
                }
              }
              else {
                // Get versions
                if($scope.selectedDoc.parentProjectFileId !== 0) {
                  documentFactory.getDocumentDetail({
                    projectId: $rootScope.currentProjectInfo.projectId,
                    projectFileId: $scope.selectedDoc.parentProjectFileId
                  })
                    .success(function(v) {
                      // Get document tags
                      onSiteFactory.getDocumentTags($scope.selectedDoc.fileId)
                        .success(function(documentTag) {
                          $scope.pdfImagePages = _.map([$scope.selectedDoc.filePath], function(el) {
                            return {
                              imagePath: el,
                              maxZoom: null
                            };
                          });
                          $scope.currentPageIndex = 0;
                          $scope.currentPage = $scope.pdfImagePages[$scope.currentPageIndex];
                          $scope.isNexting = false;
                          $scope.haveNextPage = $scope.pdfImagePages.length > 1;
                          $scope.havePrevPage = false;
                          $scope.parentDocument = v.projectFile;
                          $scope.parseTag(documentTag.tags);
                          $scope.showDocPreview = true;
                          $scope.isPreparingData = false;
                        })
                        .error(function(err) {
                          console.log(err);
                          $scope.isPreparingData = false;
                          toaster.pop('error', 'Error', 'Get document tags failed');
                        });
                    });
                }
                else {
                  // Get document tags
                  onSiteFactory.getDocumentTags($scope.selectedDoc.fileId)
                    .success(function(documentTag) {
                      $scope.pdfImagePages = _.map([$scope.selectedDoc.filePath], function(el) {
                        return {
                          imagePath: el,
                          maxZoom: null
                        };
                      });
                      $scope.currentPageIndex = 0;
                      $scope.currentPage = $scope.pdfImagePages[$scope.currentPageIndex];
                      $scope.isNexting = false;
                      $scope.haveNextPage = $scope.pdfImagePages.length > 1;
                      $scope.havePrevPage = false;
                      $scope.parentDocument = null;
                      $scope.parseTag(documentTag.tags);
                      $scope.showDocPreview = true;
                      $scope.isPreparingData = false;
                    })
                    .error(function(err) {
                      console.log(err);
                      $scope.isPreparingData = false;
                      toaster.pop('error', 'Error', 'Get document tags failed');
                    });
                }
              }
            }
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
        onSiteFactory.getNextVersionName($scope.parentDocument ? $scope.parentDocument.filePath : $scope.selectedDoc.filePath)
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
            documentFactory.saveUploadedDocsInfo(data)
              .then(function(resp) {
                if(resp.data && resp.data.documentDetail) {
                  var docId = resp.data.documentDetail.fileId;
                  var listTag = [];
                  // Join tags from pages
                  _.each($scope.pdfImagePages, function(el) {
                    listTag = _.union(listTag, el.tagList);
                  });

                  // Update new doc id for tags
                  listTag = _.map(listTag, function(el) {
                    el.projectFileId = docId;
                    return el;
                  });

                  // Save tags to document
                  onSiteFactory.addTags(listTag)
                    .then(function(resp) {
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

      $scope.$on('$destroy', function() {
        console.log('UnListen event: ', 'document.preview.' + $scope.selectedDoc.fileId);
        console.log('UnListen event: ', 'document.comment.' + $scope.selectedDoc.fileId);
        pushFactory.unbind('document.preview.' + $scope.selectedDoc.fileId);
        pushFactory.unbind('document.comment.' + $scope.selectedDoc.fileId);
      });
    }];
  return controller;
});
