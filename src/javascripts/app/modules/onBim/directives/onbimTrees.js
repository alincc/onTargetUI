define(function(require) {
  "use strict";

  var angular = require('angular'),
    _ = require('lodash');

  var directive = [function() {
    return {
      restrict: 'A',
      scope: {
        mtreeview: '='
      },
      templateUrl: 'onBim/templates/onbimTrees.html',
      controller: ['$scope', function($scope) {
        console.log($scope.mtreeview);
        $scope.childrenData = function(childrens) {
          return _.map(childrens, function(el) {
            var obj = {
              "text": el.name
            };
            if(el.type === 'Object3D' && el.children.length) {
              obj.children = $scope.childrenData(el.children);
            } else if(el.type === 'Mesh') {
              obj.icon = 'jstree-file';
              obj.text = el.uuid;
            }
            return obj;
          });
        };

        function loadData(){
          $scope.data = {
            "text": $scope.mtreeview.name === '' ? 'Root' : $scope.mtreeview.name,
            "children": $scope.childrenData($scope.mtreeview.children)
          };

          $scope.$broadcast('treeView.update');
        }

        $scope.$on('bim3dViewer.loaded', function(){
          loadData();
        });

        loadData();
      }],
      link: function() {

      }
    };
  }];
  return directive;
});