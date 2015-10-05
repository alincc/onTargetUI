define(function(require){
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash'),
    config = require('app/config'),
    template = require('text!./templates/docPreviewer.html'),
    markerTemplate = require('text!./templates/marker.html'),
    L = require('leaflet'),
    leafletDraw = require('leafletDraw'),
    leafletFullScreen = require('leafletFullScreen'),
    utilServiceModule = require('app/common/services/util'),
    module;
  module = angular.module('common.directives.docPreviewer', ['app.config', 'common.services.util']);
  module.run(['$templateCache', function($templateCache){
    $templateCache.put('docPreviewerTemplate', template);
  }]);
  module.directive('docPreviewer', ['utilFactory', '$filter', '$timeout', '$compile', function(utilFactory, $filter, $timeout, $compile){
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'docPreviewerTemplate',
      scope: {
        path: '@'
      },
      controller: ['$scope', '$http', 'appConstant', function($scope, $http, appConstant){
        var fileExtension = $scope.path.substring($scope.path.lastIndexOf('.') + 1);
        $scope.docPreviewer = {
          isLoading: true,
          fileExtension: fileExtension,
          fileMimeType: utilFactory.getFileMimeType(fileExtension),
          containerHeight: 0,
          containerWidth: 0
        };

        $scope.markers = [];

        $scope.getFileInfo = function(){
          return $http.post(appConstant.nodeServer + '/node/file/info', {path: $scope.path});
        };

        $scope.getPdfImage = function(){
          return $http.post(appConstant.nodeServer + '/node/file/getPdfImage', {path: $scope.path});
        };
      }],
      link: function(scope, elem, attrs){
        var imgH, imgW, map, markerCount = 1,
          contextMenu = angular.element(elem[0].querySelector('.doc-menu')),
          docPreviewerMap = elem[0].querySelector('#docPreviewerMap'),
          $docPreviewerMap = angular.element(docPreviewerMap),
          southWest, northEast, bounds;

        L.Icon.Default.imagePath = '/img/leaflet';

        scope.docPreviewer.containerHeight = elem[0].offsetHeight;
        scope.docPreviewer.containerWidth = elem[0].offsetWidth;

        function addMarker(obj, open){
          var markerLocation = new L.LatLng(obj.lat, obj.lng);
          var marker = new L.Marker(markerLocation);
          var markerScope;
          map.addLayer(marker);
          marker.bindPopup(markerTemplate);

          function compileMarker(){
            markerScope = scope.$new(true);
            markerScope.marker = angular.copy(obj);
            markerScope.marker.remove = function(){
              if(map.hasLayer(marker)) {
                map.removeLayer(marker);
              }
              _.remove(scope.markers, {id: obj.id});
            };

            $compile(marker._popup._contentNode)(markerScope);
          }

          marker.on("popupopen", function(e){
            // Reverse the popup if exceed the top
            // saving old anchor point X Y
            if(!e.popup.options.oldOffset) {
              e.popup.options.oldOffset = e.popup.options.offset;
            }
            var px = map.project(e.popup._latlng);
            // we calculate popup content height (jQuery)
            var heightOpeningPopup = docPreviewerMap.querySelector('.leaflet-popup-content').offsetHeight;
            var temp = px.y - heightOpeningPopup;
            var temp2 = heightOpeningPopup + 42;
            if(temp < 100) { // if it will go above the world, we prevent it to do so
              // we make the popup go below the poi instead of above
              e.popup.options.offset = new L.Point(6, temp2);
              // we make the popup tip to be pointing upward (jQuery)
              $docPreviewerMap.addClass("reverse-popup");
              e.popup.update();
            }
            else { // we allow auto pan if the popup can open in the normal upward way
              e.popup.options.offset = e.popup.options.oldOffset;
              e.popup.options.autoPan = true;
              $docPreviewerMap.removeClass("reverse-popup");
              e.popup.update();
            }

            // Fix close button
            var closeButton = docPreviewerMap.querySelector('.leaflet-popup-close-button');
            if(closeButton) {
              closeButton.setAttribute('href', '');
            }

            // Compile popup content
            compileMarker();
          });

          marker.on("popupclose", function(e){
            // Update marker
            var currentMarker = _.find(scope.markers, {id: obj.id});
            if(currentMarker) {
              currentMarker.text = markerScope.marker.text;
            }

            if(markerScope) {
              markerScope.$destroy();
            }

            e.popup.options.autoPan = false;
          });

          if(open) {
            marker.openPopup();
          }
        }

        function renderMarkers(){
          _.each(scope.markers, addMarker);
        }

        function render(resp){
          scope.docPreviewer.isLoading = false;
          imgH = resp.height;
          imgW = resp.width;
          map = L.map('docPreviewerMap', {
            minZoom: 1,
            maxZoom: 4,
            center: [0, 0],
            zoom: 2,
            crs: L.CRS.Simple,
            fullscreenControl: true,
            fullscreenControlOptions: { // optional
              title:"Full Screen",
              titleCancel:"Exit fullscreen mode"
            }
          });
          southWest = map.unproject([0, imgH], map.getMaxZoom() - 1);
          northEast = map.unproject([imgW, 0], map.getMaxZoom() - 1);
          bounds = new L.LatLngBounds(southWest, northEast);
          L.imageOverlay($filter('filePath')(resp.url), bounds).addTo(map);
          map.setMaxBounds(bounds);

          //leaflet.Draw

          var editableLayers = new L.FeatureGroup();
          map.addLayer(editableLayers);


          var options = {
            position: 'topright',
            edit: {
              featureGroup: editableLayers, //REQUIRED!!
              remove: true
            },
            draw: {
              polyline : {
                metric : false
              },
              polygon : {
                showArea: false
              },
              rectangle : {
                showArea: false
              },
              marker: false
            }
          };

          var drawControl = new L.Control.Draw(options);
          map.addControl(drawControl);

          map.on('draw:created', function (e) {
            var type = e.layerType,
              layer = e.layer;

            editableLayers.addLayer(layer);
          });

          $timeout(function(){
            map._onResize();
            renderMarkers();
          });

          map.on('click', function(e){
            //contextMenu.hide();
            scope.currentContextMenuEvent = e;
            //scope.addMarker();
          });

          map.on('contextmenu', function(e){
            //scope.currentContextMenuEvent = e;
            //contextMenu.css({
            //  'top': e.containerPoint.y + 10 + 'px',
            //  'left': e.containerPoint.x + 27 + 'px'
            //});
            //console.log(map);
            //contextMenu.show();
          });
        }

        scope.addMarker = function(){
          var e = scope.currentContextMenuEvent;
          var lat = e.latlng.lat, lng = e.latlng.lng;
          var markerObj = {
            id: markerCount++,
            lat: lat,
            lng: lng,
            text: 'This is marker ' + markerCount
          };

          scope.markers.push(markerObj);

          addMarker(markerObj, true);

          contextMenu.hide();
        };

        if(/(png|jpg|jpeg)/i.test(scope.docPreviewer.fileExtension)) {
          scope.getFileInfo()
            .success(render)
            .error(function(err){
              console.log(err);
            });
        }
        else {
          scope.getPdfImage()
            .success(render)
            .error(function(err){
              console.log(err);
            });
        }
      }
    };
  }]);
  return module;
});