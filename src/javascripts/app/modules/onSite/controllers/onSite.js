define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', 'documentFactory', '$modal', 'storage', '$stateParams', '$location', 'onSiteFactory', 'appConstant', '$filter', 'utilFactory', '$sce', '$window', 'notifications', '$state',
    function($scope, $rootScope, $q, documentFactory, $modal, storage, $stateParams, $location, onSiteFactory, appConstant, $filter, utilFactory, $sce, $window, notifications, $state) {
      var setCategoryNameOnPageLoad = function() {
        if(!_.isEmpty($scope.categories) && !!$scope.selectedCategoryId) {
          $scope.selectedCategoryName = _.result(_.find($scope.categories, function(category) {
            return category.id.toString() === $scope.selectedCategoryId.toString();
          }), 'name');
        }
      };

      $scope.app = appConstant.app;
      $scope.isLoading = false;
      $scope.viewMode = "list";
      $scope.uploadedDocumentList = [];
      $scope.uploadedDocumentArrangedList = [];
      $scope.categories = [];

      $scope.isCategorySelected = false;
      var categoryIdQueryString = $stateParams.categoryId;
      if(!!categoryIdQueryString) {
        $scope.isCategorySelected = true;
        $scope.selectedCategoryId = categoryIdQueryString;
        setCategoryNameOnPageLoad();
      }

      //$scope.isPreview = angular.isDefined($stateParams.docId);
      $scope.currentProject = $rootScope.currentProjectInfo;

      $scope.selectedDoc = null;

      function arrangeData(data, itemPerRow) {
        var list = [];
        var row = [];
        _.forEach(data, function(dt, i) {
          if(i > 0 && i % itemPerRow === 0) {
            list.push(row);
            row = [];
          }
          row.push(dt);
          if(i === data.length - 1 && row.length > 0) {
            list.push(row);
          }
        });
        return list;
      }

      //list all document
      function getUploadedDocumentList() {
        documentFactory.getUploadedDocumentList($rootScope.currentProjectInfo.projectId).
          then(function(content) {
            $scope.currentProjectId = content.data.projectId;
            $scope.uploadedDocumentList = content.data.uploadedDocumentList;

            // sort doc.versionProjectFiles descending
            $scope.uploadedDocumentList.forEach(function(doc) {
              if(doc.versionProjectFiles.length > 1) {
                doc.versionProjectFiles = _.sortBy(doc.versionProjectFiles, 'versionNo').reverse();
              }
            });

            // get document categories
            documentFactory.getCategories()
              .success(function(resp) {
                $scope.isLoading = false;
                $scope.categories = resp.categories;
                setCategoryNameOnPageLoad();
                _.forEach($scope.categories, function(category) {
                  category.count = 0;
                });

                // get category counts
                _.forEach($scope.uploadedDocumentList, function(doc) {
                  var category = _.find($scope.categories, function(cat) {
                    return cat.id === doc.projectFileCategoryId.projectFileCategoryId;
                  });

                  category.count += 1;
                });
              })
              .error(function() {
                $scope.isLoading = false;
              });

            $scope.mapData();
            $scope.uploadedDocumentArrangedList = arrangeData($scope.uploadedDocumentList, 4);
          }, function(error) {
            $scope.isLoading = false;
          });
      }

      $scope.mapData = function() {
        $scope.uploadedDocumentList = _.map($scope.uploadedDocumentList, function(el) {
          var newEl = el;
          var fileExtension = utilFactory.getFileExtension(el.name);
          var filePath = $filter('filePath')(el.name);
          el.originalFilePath = el.filePath;
          el.filePath = filePath;
          el.fileName = el.name;
          el.previewPath = filePath;
          el.isImage = /(png|jpg|jpeg|tiff|gif)/.test(fileExtension);
          if(!el.isImage) {
            el.previewPath = $sce.trustAsResourceUrl('http://docs.google.com/gview?url=' + filePath + '&embedded=true');
          }
          return newEl;
        });
      };

      $scope.preview = function(doc) {
        //$location.search('docId', doc.fileId);
        $state.go('app.previewDocument', {
          docId: doc.fileId,
          categoryId: $scope.selectedCategoryId
        });
      };

      $rootScope.$on('isLoadingDocument', function(newValue) {
        if(angular.isDefined(newValue)) {
          $scope.isLoadingDocument = false;
        }
      }, true);

      var load = function() {
        $scope.isLoading = true;
        //getDocumentDetail(getUploadedDocumentList);
        getUploadedDocumentList();
      };

      // View mode
      var viewMode = storage.get('documentViewMode');
      if(!viewMode) {
        storage.set('documentViewMode', 'grid');
      }
      $scope.viewMode = viewMode || 'grid';
      $scope.changeMode = function(mode) {
        $scope.viewMode = mode;
        storage.set('documentViewMode', mode);
        $scope.uploadedDocumentArrangedList = arrangeData($scope.uploadedDocumentList, 4);
      };

      // Upload doc
      var uploadModalInstance;
      $scope.upload = function() {
        // open modal
        uploadModalInstance = $modal.open({
          templateUrl: 'onSite/templates/upload.html',
          controller: 'UploadDocumentController',
          size: 'lg',
          resolve: {
            categories: function() {
              return $scope.categories; // resolve categories to modal
            },
            selectedCategory: function() {
              if($scope.selectedCategoryId && $scope.selectedCategoryName) {
                return {
                  id: $scope.selectedCategoryId,
                  name: $scope.selectedCategoryName
                };
              } else if(!!$scope.selectedCategoryId) {
                var category = _.find($scope.categories, {id: parseInt($scope.selectedCategoryId)});
                return {
                  id: category.id,
                  name: category.name
                };
              }
            }
          }
        });

        // modal callbacks
        uploadModalInstance.result.then(function(data) {
          getUploadedDocumentList();
        }, function() {

        });
      };

      // Preview
      $scope.backToList = function() {
        $location.search('docId', null);
        $scope.isPreview = false;
        $scope.selectedDoc = null;
      };

      // Download
      $scope.download = function(doc) {
        console.log(doc);
        if(/\.(pdf|jpg|jpeg|png|gif)$/i.test(doc.filePath)) {
          doc.isDownloading = true;
          onSiteFactory.downloadFile(doc.fileId, $rootScope.currentProjectInfo.projectId)
            .success(function(resp) {
              doc.isDownloading = false;
              var fileExt = resp.filePath.substring(resp.filePath.lastIndexOf('.') + 1).toLowerCase();
              // If custom file name extension same as the file type, then use the custom file name, otherwise, use custom file name with real file type extension
              var fileName = new RegExp('\\.' + fileExt + '$', 'i').test(doc.name) ? doc.name : (doc.name + '.' + fileExt);
              $window.open($filter('fileDownloadPathHash')(resp.filePath, fileName));
            })
            .error(function(err) {
              console.log(err);
              doc.isDownloading = false;
            });
        } else {
          var fileExt = doc.filePath.substring(doc.filePath.lastIndexOf('.') + 1).toLowerCase();
          // If custom file name extension same as the file type, then use the custom file name, otherwise, use custom file name with real file type extension
          var fileName = new RegExp('\\.' + fileExt + '$', 'i').test(doc.name) ? doc.name : (doc.name + '.' + fileExt);
          $window.open($filter('fileDownloadPathHash')(doc.originalFilePath, fileName));
        }

        //$window.open($filter('fileDownloadPathHash')(doc.name));
      };

      var deleteActivityModalInstance;
      $scope.deleteDocument = function(doc) {
        deleteActivityModalInstance = $modal.open({
          templateUrl: 'onSite/templates/delete.html',
          controller: 'DeleteDocumentController',
          size: 'sm',
          resolve: {
            document: function() {
              return doc;
            }
          }
        });

        deleteActivityModalInstance.result.then(
          function() {
            getUploadedDocumentList();
          });
      };

      // Events
      notifications.onCurrentProjectChange($scope, function(agrs) {
        $scope.isPreview = false;
        $scope.selectedDoc = null;
        $scope.isLoading = true;
        $scope.comments = [];
        $scope.uploadedDocumentList = $scope.uploadedDocumentArrangedList = [];
        getUploadedDocumentList();
      });

      $scope.chooseCategory = function(category) {
        $scope.isCategorySelected = true;
        $scope.selectedCategoryId = category.id;
        $scope.selectedCategoryName = category.name;

        //$scope.categorySelected = $rootScope.categorySelected = category;

        // Update route
        $location.search('categoryId', category.id);
      };

      $scope.filterByCategoryId = function(document) {
        if($scope.selectedCategoryId) {
          var id = document.projectFileCategoryId.projectFileCategoryId ? document.projectFileCategoryId.projectFileCategoryId : document.projectFileCategoryId.id;
          return id.toString() === $scope.selectedCategoryId.toString();
        }
      };

      $scope.backToCategories = function() {
        $scope.isCategorySelected = false;
        $scope.selectedCategoryId = 0;
        $scope.selectedCategoryName = '';

        $location.search('categoryId', null);
      };

      $scope.filterBySearchBox = function(document) {
        if(!$scope.search || $scope.search.name === '') {
          return document;
        } else if($scope.search && $scope.search.name) {
          var fileName = document.name.split('/').pop(),
            searchString = $scope.search.name.toLowerCase(),
            firstName = document.createdByContact.firstName.toLowerCase(),
            lastName = document.createdByContact.lastName.toLowerCase(),
            fullName = firstName + ' ' + lastName,
            date = new Date(document.createdDate),
            displayDate = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();

          if((fileName.toLowerCase().indexOf(searchString) !== -1) ||
            (firstName.indexOf(searchString) !== -1) ||
            (lastName.indexOf(searchString) !== -1) ||
            (fullName.indexOf(searchString) !== -1) ||
            (document.createdDate.toString().indexOf(searchString) !== -1) ||
            (displayDate.indexOf(searchString) !== -1)) {
            return true;
          }
          return false;
        }
      };

      $scope.editDocument = function(document) {
        // open modal
        var editModalInstance = $modal.open({
          templateUrl: 'onSite/templates/edit.html',
          controller: 'EditDocumentController',
          size: 'lg',
          resolve: {
            document: function() {
              return document;
            },
            categories: function() {
              return $scope.categories;
            },
            projectId: function() {
              return $scope.currentProjectId;
            }
          }
        });

        editModalInstance.result.then(function(selectedItem) {
          getUploadedDocumentList();
        }, function() {

        });
      };

      load();
    }];
  return controller;
});
