define(function(require) {
  "use strict";

  var angular = require('angular');
  var directive = [
    '$timeout',
    function($timeout) {
      return {
        restrict: 'A',
        templateUrl: 'onBim/templates/onbimComments.html',
        scope: {
          bimProject: '='
        },
        controller: [
          '$scope',
          '$rootScope',
          'onBimFactory',
          'appConstant',
          function($scope,
                   $rootScope,
                   onBimFactory,
                   appConstant) {
            console.log($scope.bimProject);
            $scope.isLoading = true;
            $scope.app = appConstant.app;
            $scope.comments = [];
            $scope.commentModel = {
              text: ''
            };
            $scope.loadComments = function() {
              onBimFactory.getCommentList($scope.bimProject.projectBimFileId)
                .success(function(res) {
                  $scope.comments = res.comments.reverse();
                  $scope.isLoading = false;
                })
                .error(function(err) {
                  console.log(err);
                  $scope.isLoading = false;
                });
            };

            $scope.addComment = function(model) {
              onBimFactory.addComment($scope.bimProject.projectBimFileId, model.text)
                .success(function(resp) {
                  $scope.comments.push(resp.projectBIMFileComment);
                  $scope.commentModel.text = '';
                  $scope.comment_frm.$setPristine();
                  $scope.$broadcast('onbimComments.Added');
                })
                .error(function(err) {
                  console.log(err);
                  $scope.comment_frm.$setPristine();
                });
            };

            $scope.loadComments();
          }],
        link: function(scope, elem, attrs) {
          var scrollContainer = elem.find('.comments'),
            isScrollAtBottom = false;
          scope.$on('onbimComments.Added', function() {
            $timeout(function() {
              if(isScrollAtBottom) {
                // Scroll at bottom
                scrollContainer.scrollTop(scrollContainer[0].scrollHeight);
              }
            });
          });

          // Check if scroll at bottom
          if(scrollContainer) {
            scrollContainer.on('scroll', function() {
              isScrollAtBottom = scrollContainer.scrollTop() + scrollContainer.innerHeight() >= scrollContainer[0].scrollHeight;
            });
          }
        }
      };
    }];
  return directive;
});