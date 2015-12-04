define(function(require) {
  'use strict';
  var angular = require('angular'),
    jQueryCustomScroll = require('jQueryCustomScroll'),
    _ = require('lodash'),
    module;
  module = angular.module('common.directives.customScroll', []);
  module.factory('CustomScroller', ['$rootScope', function($rootScope) {
    return function(scrollId) {
      var $this = this;
      this.id = scrollId;
      this.atBottom = false;

      this.updateScroll = function() {
        $rootScope.$broadcast('customScroll.' + scrollId + '.updateScroll');
      };

      this.scrollTo = function(e) {
        $rootScope.$broadcast('customScroll.' + scrollId + '.scrollTo', e);
      };
    };
  }]);
  module.factory('$customScroll', [function() {
    var scrollers = [],
      services = {};

    services.add = function(scroller) {
      scrollers.push(scroller);
    };

    services.remove = function(id) {
      _.remove(scrollers, {id: id});
    };

    services.update = function(id, obj) {
      var found = services.get(id);
      if(found) {
        var idx = _.findIndex(scrollers, {id: id});
        scrollers[idx] = angular.extend(found, obj);
      }
    };

    services.get = function(id) {
      if(id) {
        return _.find(scrollers, {id: id});
      } else {
        return scrollers[scrollers.length - 1];
      }
    };

    return services;
  }]);
  module.directive('customScroll', [
    '$customScroll',
    'utilFactory',
    '$rootScope',
    'CustomScroller',
    '$timeout',
    function($customScroll,
             utilFactory,
             $rootScope,
             CustomScroller,
             $timeout) {
      return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
          var scrollId = attrs.customScroll || utilFactory.makeId(5),
            scroller = new CustomScroller(scrollId);

          $customScroll.add(scroller);

          elem.mCustomScrollbar({
            axis: "y", // horizontal scrollbar
            scrollInertia: 200,
            scrollbarPosition: "outside",
            callbacks: {
              onScroll: function() {
                scroller.atBottom = this.mcs.topPct === 100;
              }
            }
          });

          scope.$on('content.reload', function() {
            elem.mCustomScrollbar("update");
          });

          scope.$on('customScroll.' + scrollId + '.updateScroll', function() {
            console.log('update scroll');
            elem.mCustomScrollbar("update");
          });

          scope.$on('customScroll.' + scrollId + '.scrollTo', function(e, dt) {
            console.log('scroll to: ', dt);
            $timeout(function() {
              elem.mCustomScrollbar("scrollTo", dt);
            });
          });

          scope.$on('$destroy', function() {
            elem.mCustomScrollbar("destroy");
            $customScroll.remove(scrollId);
          });
        }
      };
    }]);
  return module;
});