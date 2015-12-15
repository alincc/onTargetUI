define(function(require) {
  'use strict';
  var angular = require('angular');
  var controller = [
    '$scope',
    'appConstant',
    '$rootScope',
    'project',
    function($scope,
             appConstant,
             $rootScope,
             project) {
      $scope.app = appConstant.app;
      $scope.bimProject = project;
      $scope.mobject = {};
      $scope.mtreeview = {};
      $scope.mtypesview = {};
      $scope.minfo = {};
      $scope.data = {};
      $scope.settings = {
        isShow: false,
        toggleRightSide: function() {
          this.isShow = !this.isShow;
        },
        state: 'trees',
        changeState: function(state) {
          this.state = state;
        }
      };
      $scope.updateProperties = function(foo) {
        $scope.mobject = foo;
        $scope.minfo = foo.name.split("_");
        $scope.$digest();
      };
      $scope.setTreeView = function(scene) {
        $scope.mtreeview = scene;
      };
      $scope.setTypesView = function(typelist) {
        $scope.mtypesview = typelist;
      };
    }
  ];
  return controller;
});