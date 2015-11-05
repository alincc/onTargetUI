define(function(require) {
  'use strict';
  var angular = require('angular'),
    lodash = require('lodash'),
    config = require('app/config'),
    template = require('text!./templates/pdfTaggingMarkUp.html'),
    markerTemplate = require('text!./templates/marker.html'),
    L = require('leaflet'),
    leafletDraw = require('leafletDraw'),
    leafletFullScreen = require('leafletFullScreen'),
    utilServiceModule = require('app/common/services/util'),
    fileServiceModule = require('app/common/services/file'),
    onSiteServiceModule = require('app/common/services/onSite'),
    documentServiceModule = require('app/common/services/document'),
    module;

  module = angular.module('common.directives.pdfTaggingMarkUp', [
    'app.config',
    'common.services.util',
    'common.services.file',
    'common.services.onSite',
    'common.services.document'
  ]);

  module.run([
    '$templateCache',
    function($templateCache) {
      $templateCache.put('pdfTaggingMarkUpTemplate', template);
    }]);

  module.directive('pdfTaggingMarkUp', [
    'utilFactory',
    '$filter',
    '$timeout',
    '$compile',
    'appConstant',
    '$rootScope',
    'documentFactory',
    '$q',
    'fileFactory',
    'onSiteFactory',
    function(utilFactory,
             $filter,
             $timeout,
             $compile,
             appConstant,
             $rootScope,
             documentFactory,
             $q,
             fileFactory,
             onSiteFactory) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'pdfTaggingMarkUpTemplate',
        scope: {
          path: '@',
          selectedDoc: '=',
          imagePath: '@'
        },
        controller: [
          '$scope',
          'appConstant',
          '$state',
          'fileFactory',
          'onSiteFactory',
          function($scope,
                   appConstant,
                   $state,
                   fileFactory,
                   onSiteFactory) {
            var fileExtension = $scope.path.substring($scope.path.lastIndexOf('.') + 1);
            var fileName = $scope.path.substring($scope.path.lastIndexOf('/') + 1);
            var fileNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));

            // Generate original file path
            $scope.originalFilePath = $scope.path;
            if(/.*\-\d+\./.test(fileName)) {
              $scope.originalFilePath =
                $scope.path.substring(0, $scope.path.lastIndexOf('/')) + '/' +
                fileNameWithoutExtension.substring(0, fileNameWithoutExtension.lastIndexOf('-')) +
                '.' + fileExtension;
            }

            console.log($scope.path, $scope.originalFilePath);

            $scope.pdfTaggingMarkUp = {
              isLoading: true,
              fileExtension: fileExtension,
              fileMimeType: utilFactory.getFileMimeType(fileExtension),
              containerHeight: 0,
              containerWidth: 0
            };

            $scope.markers = [];

            $scope.docInfo = {
              docId: $state.params.docId
            };

            $scope.getFileInfo = function() {
              return fileFactory.info($scope.originalFilePath);
            };

            $scope.addComment = function(id, comment) {
              return onSiteFactory.addTagComment(id, comment);
            };

            $scope.getPdfImage = function() {
              return fileFactory.getPdfImage($scope.originalFilePath);
            };

            $scope.addTags = function(tags) {
              return onSiteFactory.addTags(tags);
            };

            $scope.getProjectFileTagId = function(id) {
              return onSiteFactory.getTagsByDocument(id);
            };
          }],
        link: function(scope, elem) {
          var imgH, imgW, map, markerCount = 1,
            contextMenu = angular.element(elem[0].querySelector('.doc-menu')),
            pdfTaggingMarkUpMap = elem[0].querySelector('#pdfTaggingMarkUpMap'),
            $pdfTaggingMarkUpMap = angular.element(pdfTaggingMarkUpMap),
            southWest, northEast, bounds;

          L.Icon.Default.imagePath = '/img/leaflet';

          scope.listLayers = [];
          scope.selectedDoc.listLayer = scope.listLayers;
          scope.pdfTaggingMarkUp.containerHeight = elem[0].offsetHeight;
          scope.pdfTaggingMarkUp.containerWidth = elem[0].offsetWidth;

          function guid() {
            function s4() {
              return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
              s4() + '-' + s4() + s4() + s4();
          }

          function x(a, b) {
            return Math.log2(a / b) + 1;
          }

          function addMarker(obj, open) {
            var markerLocation = new L.LatLng(obj.lat, obj.lng);
            var marker = new L.Marker(markerLocation);
            var markerScope;
            map.addLayer(marker);
            marker.bindPopup(markerTemplate);

            function compileMarker() {
              markerScope = scope.$new(true);
              markerScope.marker = angular.copy(obj);
              markerScope.marker.remove = function() {
                if(map.hasLayer(marker)) {
                  map.removeLayer(marker);
                }
                _.remove(scope.markers, {id: obj.id});
              };

              $compile(marker._popup._contentNode)(markerScope);
            }

            marker.on("popupopen", function(e) {
              // Reverse the popup if exceed the top
              // saving old anchor point X Y
              if(!e.popup.options.oldOffset) {
                e.popup.options.oldOffset = e.popup.options.offset;
              }
              var px = map.project(e.popup._latlng);
              // we calculate popup content height (jQuery)
              var heightOpeningPopup = pdfTaggingMarkUpMap.querySelector('.leaflet-popup-content').offsetHeight;
              var temp = px.y - heightOpeningPopup;
              var temp2 = heightOpeningPopup + 42;
              if(temp < 100) { // if it will go above the world, we prevent it to do so
                // we make the popup go below the poi instead of above
                e.popup.options.offset = new L.Point(6, temp2);
                // we make the popup tip to be pointing upward (jQuery)
                $pdfTaggingMarkUpMap.addClass("reverse-popup");
                e.popup.update();
              }
              else { // we allow auto pan if the popup can open in the normal upward way
                e.popup.options.offset = e.popup.options.oldOffset;
                e.popup.options.autoPan = true;
                $pdfTaggingMarkUpMap.removeClass("reverse-popup");
                e.popup.update();
              }

              // Fix close button
              var closeButton = pdfTaggingMarkUpMap.querySelector('.leaflet-popup-close-button');
              if(closeButton) {
                closeButton.setAttribute('href', '');
              }

              // Compile popup content
              compileMarker();
            });

            marker.on("popupclose", function(e) {
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

          function renderMarkers() {
            _.each(scope.markers, addMarker);
          }

          function render(resp) {
            scope.pdfTaggingMarkUp.isLoading = false;
            scope.imgUrl = resp.url;
            imgH = resp.height;
            imgW = resp.width;
            map = L.map('pdfTaggingMarkUpMap', {
              minZoom: 1,
              maxZoom: 4,
              center: [0, 0], // - , -
              zoom: 1,
              crs: L.CRS.Simple,
              fullscreenControl: true,

              fullscreenControlOptions: { // optional
                title: "Full Screen",
                titleCancel: "Exit fullscreen mode"
              }
            });

            /*southWest = map.unproject([0, imgH], 2);
            northEast = map.unproject([imgW, 0], 2);*/
            southWest = map.unproject([0, imgH], x(imgW * 2, scope.pdfTaggingMarkUp.containerWidth));
            northEast = map.unproject([imgW, 0], x(imgW * 2, scope.pdfTaggingMarkUp.containerWidth));
            bounds = new L.LatLngBounds(southWest, northEast);
            L.imageOverlay($filter('filePath')(resp.url), bounds).addTo(map);
            //map.setMaxBounds(bounds);
            //map.fitBounds(bounds);

            var fitHeight = map.unproject([0, imgH], x(imgH * 2, scope.pdfTaggingMarkUp.containerHeight));

            map.setView([fitHeight.lat/2, northEast.lng/2], 2);

            //leaflet.Draw

            var editableLayers = new L.FeatureGroup();

            map.addLayer(editableLayers);

            var options = {
              position: 'topright',
              edit: {
                featureGroup: editableLayers, //REQUIRED!!
                remove: true,
                edit: true
              },
              draw: {
                polyline: {
                  metric: false
                },
                polygon: {
                  showArea: false
                },
                rectangle: {
                  showArea: false
                },
                marker: {
                  repeatMode: false
                }
              }
            };

            var drawControl = new L.Control.Draw(options);
            map.addControl(drawControl);
            function onDrawCreated(e, hideOpenPopup, ignoreToLayer) {
              var type = e.layerType,
                layer = e.layer || e;
              var comments = e.comments;
              var id = guid();
              layer.id = id;
              var objLayer = layer.toGeoJSON();
              objLayer.comments = _.map(comments, function(cm) {
                return {
                  comment: cm.comment,
                  userId: cm.commentedBy,
                  author: cm.commenterContact.firstName + ' ' + cm.commenterContact.lastName,
                  commentedDate: cm.commentedDate,
                  loadedComment: true
                };
              });
              objLayer.options = layer.options;
              objLayer._mRadius = layer._getLngRadius ? layer._getLngRadius() / 2 : 0;
              objLayer.r = layer._mRadius;
              objLayer.id = id;
              objLayer.type = type;
              if(type === 'marker') {
                //var projectFileTagId = resp.data.tags[0].projectFileTagId;
                //objLayer.id = projectFileTagId;
                //layer.id = projectFileTagId;
                objLayer.layer = angular.copy(layer);
                if(true) {
                  scope.listLayers.push(objLayer);
                }
                editableLayers.addLayer(layer);

                layer.bindPopup(markerTemplate);
                var markerScope;
                var compileMarker = function() {
                  markerScope = scope.$new(true);
                  markerScope.marker = angular.copy(objLayer);
                  markerScope.marker.remove = function() {
                    if(map.hasLayer(layer)) {
                      map.removeLayer(layer);
                    }
                    _.remove(scope.markers, {id: objLayer.id});
                  };
                  markerScope.marker.add = function() {
                    if(!objLayer.comments) {
                      objLayer.comments = [];
                    }

                    objLayer.comments.push(
                      {
                        comment: this.comment,
                        userId: $rootScope.currentUserInfo.userId,
                        author: $rootScope.currentUserInfo.contact.firstName + ' ' + $rootScope.currentUserInfo.contact.lastName,
                        commentedDate: new Date().toISOString(),
                        loadedComment: false
                      });

                    markerScope.marker.comments = angular.copy(objLayer.comments);
                    // clear textbox
                    markerScope.marker.comment = "";
                    markerScope.add_comment_form.$setPristine();

                    //scope.addComment(objLayer.id, this.text);

                    //layer.closePopup();
                  };

                  $compile(layer._popup._contentNode)(markerScope);
                };

                layer.on("popupopen", function(e) {
                  // Reverse the popup if exceed the top
                  // saving old anchor point X Y
                  if(!e.popup.options.oldOffset) {
                    e.popup.options.oldOffset = e.popup.options.offset;
                  }
                  var px = map.project(e.popup._latlng);
                  // we calculate popup content height (jQuery)
                  var heightOpeningPopup = pdfTaggingMarkUpMap.querySelector('.leaflet-popup-content').offsetHeight;
                  var temp = px.y - heightOpeningPopup;
                  var temp2 = heightOpeningPopup + 42;
                  if(temp < 100) { // if it will go above the world, we prevent it to do so
                    // we make the popup go below the poi instead of above
                    e.popup.options.offset = new L.Point(6, temp2);
                    // we make the popup tip to be pointing upward (jQuery)
                    $pdfTaggingMarkUpMap.addClass("reverse-popup");
                    e.popup.update();
                  }
                  else { // we allow auto pan if the popup can open in the normal upward way
                    e.popup.options.offset = e.popup.options.oldOffset;
                    e.popup.options.autoPan = true;
                    $pdfTaggingMarkUpMap.removeClass("reverse-popup");
                    e.popup.update();
                  }

                  // Fix close button
                  var closeButton = pdfTaggingMarkUpMap.querySelector('.leaflet-popup-close-button');
                  if(closeButton) {
                    closeButton.setAttribute('href', '');
                  }

                  // Compile popup content
                  compileMarker();
                });

                layer.on("popupclose", function(e) {
                  // Update marker
                  var currentMarker = _.find(scope.markers, {id: objLayer.id});
                  if(currentMarker) {
                    currentMarker.text = markerScope.marker.text;
                  }

                  if(markerScope) {
                    markerScope.$destroy();
                  }

                  e.popup.options.autoPan = false;
                });

                if(!hideOpenPopup) {
                  layer.openPopup();
                } else {
                  compileMarker();
                }

              }
              else {
                objLayer.layer = angular.copy(layer);
                if(true) {
                  scope.listLayers.push(objLayer);
                }
                editableLayers.addLayer(layer);
              }
            }

            map.on('draw:created', onDrawCreated);

            map.on('draw:deleted', function(e) {
              console.log('delete');
              var layers = e.layers._layers;
              _.each(layers, function(objLayer, k) {
                var id = objLayer.id;
                scope.listLayers = _.filter(scope.listLayers, function(l) {
                  return l.id !== id;
                });
              });
              //var objLayer = layer.toGeoJSON();
              //objLayer.options = layer.options;
              //objLayer._mRadius = layer._mRadius;
              //scope.listLayers.push(objLayer);
              //editableLayers.addLayer(layer);
            });
            map.on('draw:edited', function(e) {
              var layers = e.layers._layers,
                listGeo = e.layers.toGeoJSON().features;
              var i = 0;
              _.each(layers, function(objLayer, k) {
                var id = objLayer.id;
                scope.listLayers = _.filter(scope.listLayers, function(l) {
                  return l.id !== id;
                });
                var objL = listGeo[i];
                var newObjL = objL;
                newObjL.options = objLayer.options;
                newObjL._mRadius = objLayer._getLngRadius ? objLayer._getLngRadius() / 2 : 0;
                newObjL.r = objLayer._mRadius;
                newObjL.type = objLayer.layerType;
                scope.listLayers.push(newObjL);
                editableLayers.addLayer(objLayer);
                i = i + 1;
              });
              //var layers = e.layers._layers;
              //_.each(layers, function (objLayer, k){
              //  var id = objLayer.id;
              //  scope.listLayers = _.fiter(scope.listLayers, function (l){
              //    return l.id !== id;
              //  });
              //  scope.listLayers.push()
              //});
            });
            $timeout(function() {
              map._onResize();
              renderMarkers();
            });

            map.on('click', function(e) {
              //contextMenu.hide();
              scope.currentContextMenuEvent = e;
              //scope.addMarker();

              // Stop edit layer
              //stopEditing();
            });

            map.on('contextmenu', function(e) {
              //scope.currentContextMenuEvent = e;
              //contextMenu.css({
              //  'top': e.containerPoint.y + 10 + 'px',
              //  'left': e.containerPoint.x + 27 + 'px'
              //});
              //console.log(map);
              //contextMenu.show();
            });

            if($rootScope.pdfTaggingMarkUpEditData) {
              _.each($rootScope.pdfTaggingMarkUpEditData, function(tag) {
                var attrs = tag.attributes;
                var type = _.filter(attrs, function(a) {
                  return a.key === 'type';
                });
                var options = _.reduce(attrs, function(memo, a) {
                  if(a.key.startsWith('options.')) {
                    var keys = a.key.split('.')[1], value = a.value;
                    memo[keys] = value;
                  }
                  return memo;
                }, {});
                if(type.length) {
                  var t = type[0].value, geo, coords;
                  switch(t) {
                    case 'rectangle':
                    {
                      geo = _.filter(attrs, function(a) {
                        return a.key.startsWith('geo.');
                      });
                      coords = _.reduce(geo, function(memo, g) {
                        var key = g.key,
                          value = parseInt(g.value, 10);
                        var info = key.split('.'), id = parseInt(info[1], 10), id2 = parseInt(info[2], 10);
                        if(memo[id]) {
                          memo[id][id2] = value;
                        } else {
                          var obj = [];
                          obj[id2] = value;
                          memo[id] = obj;
                        }
                        return memo;
                      }, []);
                      var rectangle = L.rectangle(coords, options), rectangle2 = angular.copy(rectangle);
                      //rectangle2.addTo(map);
                      rectangle.layerType = t;
                      onDrawCreated(rectangle, true, true);
                      break;
                    }
                    case 'polygon':
                    {
                      geo = _.filter(attrs, function(a) {
                        return a.key.startsWith('geo.');
                      });
                      coords = _.reduce(geo, function(memo, g) {
                        var key = g.key,
                          value = parseInt(g.value, 10);
                        var info = key.split('.'), id = parseInt(info[1], 10), id2 = parseInt(info[2], 10);
                        if(memo[id]) {
                          memo[id][id2] = value;
                        } else {
                          var obj = [];
                          obj[id2] = value;
                          memo[id] = obj;
                        }
                        return memo;
                      }, []);
                      var polygon = L.polygon(coords, options), polygon2 = angular.copy(polygon);
                      //polygon2.addTo(map);
                      polygon.layerType = t;
                      onDrawCreated(polygon, true, true);
                      break;
                    }
                    case 'polyline':
                    {
                      geo = _.filter(attrs, function(a) {
                        return a.key.startsWith('geo.');
                      });
                      coords = _.reduce(geo, function(memo, g) {
                        var key = g.key,
                          value = parseInt(g.value, 10);
                        var info = key.split('.'), id = parseInt(info[1], 10), id2 = parseInt(info[2], 10);
                        if(memo[id]) {
                          memo[id][id2] = value;
                        } else {
                          var obj = [];
                          obj[id2] = value;
                          memo[id] = obj;
                        }
                        return memo;
                      }, []);
                      var polyline = L.polyline(coords, options), polyline2 = angular.copy(polyline);
                      //polyline2.addTo(map);
                      polyline.layerType = t;
                      onDrawCreated(polyline, true, true);
                      break;
                    }
                    case 'circle':
                    {
                      var radius = _.filter(attrs, function(a) {
                        return a.key.startsWith('radius');
                      });
                      var circleRadius = 0;
                      if(radius.length) {
                        circleRadius = parseFloat(radius[0].value);
                      }
                      geo = _.filter(attrs, function(a) {
                        return a.key.startsWith('geo.');
                      });
                      coords = _.reduce(geo, function(memo, g) {
                        var key = g.key,
                          value = parseInt(g.value, 10);
                        var info = key.split('.'), id = parseInt(info[1], 10), id2 = parseInt(info[2], 10);
                        if(memo[id]) {
                          memo[id][id2] = value;
                        } else {
                          var obj = [];
                          obj[id2] = value;
                          memo[id] = obj;
                        }
                        return memo;
                      }, []);
                      var circle = L.circle(coords[0], circleRadius, options), circle2 = angular.copy(circle);
                      //circle2.addTo(map);
                      circle.layerType = t;
                      onDrawCreated(circle, true, true);
                      break;
                    }
                    case 'marker':
                    {
                      geo = _.filter(attrs, function(a) {
                        return a.key.startsWith('geo.');
                      });
                      coords = _.reduce(geo, function(memo, g) {
                        var key = g.key,
                          value = parseInt(g.value, 10);
                        var info = key.split('.'), id = parseInt(info[1], 10), id2 = parseInt(info[2], 10);
                        if(memo[id]) {
                          memo[id][id2] = value;
                        } else {
                          var obj = [];
                          obj[id2] = value;
                          memo[id] = obj;
                        }
                        return memo;
                      }, []);
                      var marker = L.marker(coords[0]), marker2 = angular.copy(marker);
                      //marker2.addTo(map);
                      marker.layerType = t;
                      marker.comments = tag.comment;
                      onDrawCreated(marker, true, true);
                    }
                  }
                }

              });
            }
          }

          scope.addMarker = function() {
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

          if(/(png|jpg|jpeg)/i.test(scope.pdfTaggingMarkUp.fileExtension)) {
            scope.getFileInfo()
              .success(render)
              .error(function(err) {
                console.log(err);
              });
          }
          else {
            scope.getPdfImage()
              .success(render)
              .error(function(err) {
                console.log(err);
              });
          }

          scope.addTag = function(tags) {
            return onSiteFactory.addTags(tags);
          };

          scope.extractListTags = function(doc, docId) {
            //return _.map(doc.listLayer, function(m) {
            var layers = angular.copy(scope.listLayers);
            return _.map(layers, function(m) {
              if(m.type === 'marker') {
                var listComment = _.map(m.comments, function(cm) {
                  return {
                    commentId: null,
                    comment: cm.comment,
                    commentedBy: cm.author,
                    commentedDate: cm.commentedDate,
                    commenterContact: null
                  };
                });
                return {
                  'projectFileId': docId,
                  'projectFileTagId': null,
                  'parentFileTagId': null,
                  'tag': 'TAG',
                  'title': 'TAG',
                  'lattitude': m.layer.getLatLng().lat,
                  'longitude': m.layer.getLatLng().lng,
                  'tagType': 'TAG',
                  'tagFilePath': '',
                  'status': null,
                  'addedBy': $rootScope.currentUserInfo.userId,
                  'addedDate': new Date().toISOString(),
                  'attributes': [
                    {
                      key: 'type',
                      value: 'marker',
                      'projectFileTagAttributeId': null
                    },
                    {
                      key: 'geo.0.0',
                      value: m.layer.getLatLng().lat,
                      'projectFileTagAttributeId': null
                    },
                    {
                      key: 'geo.0.1',
                      value: m.layer.getLatLng().lng,
                      'projectFileTagAttributeId': null
                    }
                  ],
                  comment: listComment
                };
              }
              var attr = [];
              _.each(m.options, function(v, k) {
                if(v) {
                  attr.push({
                    key: 'options.' + k,
                    value: v,
                    'projectFileTagAttributeId': null
                  });
                }
              });
              if(m.type !== 'polyline') {
                if(m.geometry.coordinates[0].length) {
                  _.each(m.geometry.coordinates[0], function(coo, k) {
                    attr.push({
                      key: 'geo.' + k + '.1',
                      value: coo[0],
                      'projectFileTagAttributeId': null
                    });
                    attr.push({
                      key: 'geo.' + k + '.0',
                      value: coo[1],
                      'projectFileTagAttributeId': null
                    });
                  });
                } else {
                  attr.push({
                    key: 'geo.0.0',
                    value: m.geometry.coordinates[1],
                    'projectFileTagAttributeId': null
                  });
                  attr.push({
                    key: 'geo.0.1',
                    value: m.geometry.coordinates[0],
                    'projectFileTagAttributeId': null
                  });
                }
              } else {
                _.each(m.geometry.coordinates, function(c, k) {
                  attr.push({
                    key: 'geo.' + k + '.0',
                    value: c[1],
                    'projectFileTagAttributeId': null
                  });
                  attr.push({
                    key: 'geo.' + k + '.1',
                    value: c[0],
                    'projectFileTagAttributeId': null
                  });
                });
              }


              attr.push({
                key: '_mRadius',
                value: m._mRadius || 0,
                'projectFileTagAttributeId': null
              });
              attr.push({
                key: 'radius',
                value: m.r || 0,
                'projectFileTagAttributeId': null
              });
              attr.push({
                key: 'type',
                value: m.type,
                'projectFileTagAttributeId': null
              });
              return {
                'projectFileId': docId,
                'projectFileTagId': null,
                'parentFileTagId': null,
                'tag': 'TAg',
                'title': 'TAG',
                'tagType': 'TAG',
                'tagFilePath': '',
                'status': null,
                'addedBy': $rootScope.currentUserInfo.userId,
                'addedDate': new Date().toISOString(),
                attributes: attr,
                comment: []
                //'attributes': [
                //  //{
                //  //  'key': '_mRadius',
                //  //  'value': m._mRadius,
                //  //  'projectFileTagAttributeId': null
                //  //},
                //  //{
                //  //  'key': 'geometry',
                //  //  'value': JSON.stringify(m.geometry),
                //  //  'projectFileTagAttributeId': null
                //  //}, {
                //  //  'key': 'options',
                //  //  'value': JSON.stringify(m.options),
                //  //  'projectFileTagAttributeId': null
                //  //},
                //  //{
                //  //  key: 'type',
                //  //  value: m.type,
                //  //  'projectFileTagAttributeId': null
                //  //},
                //  //{
                //  //  key: 'latlng',
                //  //  value: JSON.stringify(m.layer.getLatLngs()),
                //  //  'projectFileTagAttributeId': null
                //  //}
                //]
              };
            });
          };

          scope.extractListComment = function(doc) {
            return _.reduce(doc.listLayer, function(memo, m) {
              if(m.type === 'marker' && m.comments && m.comments.length) {
                if(!memo) {
                  memo = [];
                }
                _.each(m.comments, function(comment) {
                  memo.push({
                    comment: comment.text,
                    projectFileTagId: doc.fileId
                  });
                });
                return memo;
              }
            }, []);
          };

          scope.exportPdf = function(fileName, width, height) {
            var deferred = $q.defer();
            var layers = angular.copy(scope.listLayers);
            _.each(layers, function(l) {
              if(l.layer && l.layer._leaflet_events) {
                delete l.layer._leaflet_events;
              }
              if(l.layer && angular.isDefined(l.layer.editing)) {
                delete l.layer.editing;
              }
            });
            onSiteFactory.exportPdf({
              path: scope.imgUrl,
              geo: layers,
              width: width,
              height: height,
              scale: x(imgW * 2, scope.pdfTaggingMarkUp.containerWidth),
              projectAssetFolderName: $rootScope.currentProjectInfo.projectAssetFolderName,
              fileName: fileName

            })
              .success(function(dt) {
                deferred.resolve(dt);
              });
            return deferred.promise;
          };

          scope.$on('pdfTaggingMarkUp.SaveTheDoc', function(e, args) {
            var img = document.querySelector('.leaflet-image-layer');
            var doc = args.doc;
            var width = img.width;
            var height = img.height;
            if(!doc) {
              return;
            }

            onSiteFactory.getNextVersionName(scope.originalFilePath)
              .success(function(resp) {
                var newFilePath = resp.newVersionName;
                var newFileName = newFilePath.substring(newFilePath.lastIndexOf('/'));
                var data = {
                  "projectId": $rootScope.currentProjectInfo.projectId,
                  "name": newFilePath,
                  "fileType": doc.fileType,
                  "createdBy": $rootScope.currentUserInfo.userId,
                  "modifiedBy": $rootScope.currentUserInfo.userId,
                  "categoryId": doc.projectFileCategoryId.projectFileCategoryId,
                  "description": doc.description
                };
                documentFactory.saveUploadedDocsInfo(data).then(function(resp) {
                  if(resp.data && resp.data.documentDetail) {
                    var docId = resp.data.documentDetail.fileId;
                    var listTag = scope.extractListTags(doc, docId);
                    scope.addTag(listTag).then(function(resp) {
                      scope.exportPdf(newFileName, width, height).then(function(dt) {
                        fileFactory.convertPDFToImage(dt.path).then(function(r) {
                          scope.$emit('pdfTaggingMarkUp.SaveDone', {url: r.url, docId: docId});
                        }, function(err) {
                          console.log(err);
                          scope.$emit('pdfTaggingMarkUp.SaveError', {error: err});
                        });
                      }, function(err) {
                        console.log(err);
                        scope.$emit('pdfTaggingMarkUp.SaveError', {error: err});
                      });
                    }, function(err) {
                      console.log(err);
                      scope.$emit('pdfTaggingMarkUp.SaveError', {error: err});
                    });
                  }
                }, function(err) {
                  console.log(err);
                  scope.$emit('pdfTaggingMarkUp.SaveError', {error: err});
                });
              })
              .error(function(err) {
                console.log(err);
                scope.$emit('pdfTaggingMarkUp.SaveError', {error: err});
              });
          });
        }
      };
    }]);

  return module;
});