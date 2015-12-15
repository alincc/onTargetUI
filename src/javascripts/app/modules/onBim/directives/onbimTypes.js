define(function(require) {
  "use strict";

  var directive = [function() {
    return {
      restrict: 'A',
      scope: {
        mtypesview: '='
      },
      templateUrl: 'onBim/templates/onbimTypes.html',
      controller: ['$scope', function($scope) {

        function loadData() {
          $scope.data = [];
          _.forOwn($scope.mtypesview, function(value, key) {
            if(/^Ifc/i.test(key)) {
              $scope.data.push({
                name: key.substring(3, key.length).replace(/([a-z])([A-Z])/g, '$1 $2'),
                number: value.length
              });
            }
          });
        }

        $scope.$on('bim3dViewer.loaded', function() {
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