define(function(require){
  'use strict';
  var angular = require('angular');
  var controller = ['$scope', '$rootScope', '$q', 'documentFactory', '$modal', 'storage', '$stateParams', '$location', 'onSiteFactory', 'appConstant', '$filter', 'utilFactory', '$sce', '$window', 'notifications', '$state', 'document',
    function($scope, $rootScope, $q, documentFactory, $modal, storage, $stateParams, $location, onSiteFactory, appConstant, $filter, utilFactory, $sce, $window, notifications, $state, document){
      $scope.selectedDoc = document;

      var mapData = function(){
        var fileExtension = utilFactory.getFileExtension($scope.selectedDoc.name);
        var filePath = $filter('filePath')($scope.selectedDoc.name);
        $scope.selectedDoc.filePath = filePath;
        $scope.selectedDoc.previewPath = filePath;
        $scope.selectedDoc.isImage = /(png|jpg|jpeg|tiff|gif)/.test(fileExtension);
          if(!$scope.selectedDoc.isImage) {
            $scope.selectedDoc.previewPath = $sce.trustAsResourceUrl('http://docs.google.com/gview?url=' + filePath + '&embedded=true');
          }
      };

      // Comments
      $scope.comments = [];
      $scope.isLoadingComment = false;
      $scope.addCommentModel = {
        comment: ''
      };

      $scope.loadComment = function(){
        $scope.isLoadingComment = true;
        onSiteFactory.getFileComment($scope.selectedDoc.fileId)
          .success(function(resp){
            $scope.comments = resp.comments;
            // update scroll
            $scope.$broadcast('content.reload');
            $scope.isLoadingComment = false;
          })
          .error(function(err){
            console.log(err);
            $scope.isLoadingComment = false;
          });
      };

      $scope.addComment = function(model, form){
        if($scope.selectedDoc) {
          onSiteFactory.addComment($scope.selectedDoc.fileId, model.comment, $scope.selectedDoc.name, $scope.selectedDoc.createdBy)
            .success(function(resp){
              $scope.comments.push({
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
            .error(function(err){
              console.log(err);
            });
        }
      };
      
      $scope.backToList = function (){
        $state.go("app.onSite");
      };

      mapData();
      $scope.loadComment();
    }];
  return controller;
});
