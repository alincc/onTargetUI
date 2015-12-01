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
    'appConstant',
    function(utilFactory,
             $filter,
             $timeout,
             $compile,
             appConstant,
             $rootScope,
             documentFactory,
             $q,
             fileFactory,
             onSiteFactory,
             constant) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'pdfTaggingMarkUpTemplate',
        scope: {
          selectedDoc: '=',
          model: '=',
          pageNumber: '@',
          maxNativeZoom: '='
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
            $scope.fileExtension = $scope.selectedDoc.filePath.substring($scope.selectedDoc.filePath.lastIndexOf('.') + 1);
            $scope.fileName = $scope.selectedDoc.filePath.substring($scope.selectedDoc.filePath.lastIndexOf('/') + 1);
            $scope.fileNameWithoutExtension = $scope.fileName.substring(0, $scope.fileName.lastIndexOf('.'));

            // Generate original file path
            $scope.originalFilePath = $scope.selectedDoc.filePath;

            $scope.pdfTaggingMarkUp = {
              isLoading: true,
              fileExtension: $scope.fileExtension,
              fileMimeType: utilFactory.getFileMimeType($scope.fileExtension),
              containerHeight: 0,
              containerWidth: 0
            };

            $scope.markers = [];
            $scope.maxNativeZoom = angular.isDefined($scope.maxNativeZoom) ? $scope.maxNativeZoom : null;

            $scope.docInfo = {
              docId: $state.params.docId
            };

            $scope.getFileInfo = function() {
              if($scope.selectedDoc.originalFilePath) {
                return fileFactory.info($scope.selectedDoc.originalFilePath);
              } else {
                return fileFactory.info($scope.model.imagePath);
              }
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
          var imgH, imgW, map, tile_layer, markerCount = 1,
            contextMenu = angular.element(elem[0].querySelector('.doc-menu')),
            pdfTaggingMarkUpMap = elem[0].querySelector('#pdfTaggingMarkUpMap'),
            $pdfTaggingMarkUpMap = angular.element(pdfTaggingMarkUpMap),
            southWest, northEast, bounds, tileSize = 256, maxZoom = 5, minZoom = 1;

          L.Icon.Default.imagePath = '/img/leaflet';

          scope.listLayers = [];
          scope.selectedDoc.listLayer = scope.listLayers;
          scope.pdfTaggingMarkUp.containerHeight = elem[0].offsetHeight;
          scope.pdfTaggingMarkUp.containerWidth = elem[0].offsetWidth;

          function x(a, b) {
            return Math.log2(a / b) + 1;
          }

          function addMarker(obj, open) {
            var markerLocation = new L.LatLng(obj.lat, obj.lng);
            var marker = new L.Marker(markerLocation);
            var markerScope;
            map.addLayer(marker);
            marker.bindPopup(markerTemplate);

            function compileMarker(cb) {
              markerScope = scope.$new(true);
              markerScope.marker = angular.copy(obj);
              markerScope.marker.remove = function() {
                if(map.hasLayer(marker)) {
                  map.removeLayer(marker);
                }
                _.remove(scope.markers, {id: obj.id});
              };
              markerScope.marker.linkTask = function() {
                $rootScope.$broadcast('pdfTaggingMarkup.Tag.LinkTask');
              };

              $compile(marker._popup._contentNode)(markerScope);

              if(cb) {
                cb(markerScope);
              }
            }

            marker.on("popupopen", function(e) {
              //// Reverse the popup if exceed the top
              //// saving old anchor point X Y
              //if(!e.popup.options.oldOffset) {
              //  e.popup.options.oldOffset = e.popup.options.offset;
              //}
              //var px = map.project(e.popup._latlng);
              //// we calculate popup content height (jQuery)
              //var heightOpeningPopup = pdfTaggingMarkUpMap.querySelector('.leaflet-popup-content').offsetHeight;
              //var temp = px.y - heightOpeningPopup;
              //var temp2 = heightOpeningPopup + 42;
              //if(temp < 100) { // if it will go above the world, we prevent it to do so
              //  // we make the popup go below the poi instead of above
              //  e.popup.options.offset = new L.Point(6, temp2);
              //  // we make the popup tip to be pointing upward (jQuery)
              //  $pdfTaggingMarkUpMap.addClass("reverse-popup");
              //  e.popup.update();
              //}
              //else { // we allow auto pan if the popup can open in the normal upward way
              //  e.popup.options.offset = e.popup.options.oldOffset;
              //  e.popup.options.autoPan = true;
              //  $pdfTaggingMarkUpMap.removeClass("reverse-popup");
              //  e.popup.update();
              //}
              //
              // Fix close button
              var closeButton = pdfTaggingMarkUpMap.querySelector('.leaflet-popup-close-button');
              if(closeButton) {
                closeButton.setAttribute('href', '');
                angular.element(closeButton).on('click', function() {
                  $timeout(function() {
                    $rootScope.selectedProjetFileTag = null;
                    $rootScope.$broadcast('pdfTaggingMarkup.popupclose');
                    scope.updatePageData();
                  });
                });
                marker.closeButton = closeButton;
              }

              // Compile popup content
              compileMarker(function(markerScope) {
                $timeout(function() {
                  if(markerScope.marker.isLinked) {
                    $rootScope.$broadcast('pdfTaggingMarkup.Tag.ViewTask', {
                      taskId: markerScope.marker.taskLink.taskId
                    });
                  }
                  $rootScope.$broadcast('pdfTaggingMarkup.popupopen');
                });
              });
            });

            marker.on("popupclose", function(e) {
              // Update marker
              var currentMarker = _.find(scope.markers, {id: obj.id});
              if(currentMarker) {
                currentMarker.text = markerScope.marker.text;
              }

              if(marker.closeButton) {
                angular.element(marker.closeButton).off('click');
              }

              if(markerScope) {
                markerScope.$destroy();
              }

              e.popup.options.autoPan = false;

              $timeout(function() {
                $rootScope.selectedProjetFileTag = null;
                $rootScope.$broadcast('pdfTaggingMarkup.popupclose');
              });

              scope.updatePageData();
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
            //imgH = resp.height;
            //imgW = resp.width;

            imgH = tileSize * Math.pow(2, maxZoom);
            imgW = tileSize * Math.pow(2, maxZoom);

            // Custom CRS
            L.CRS.Screen = L.extend({}, L.CRS, {
              projection: L.Projection.LonLat,
              transformation: new L.Transformation(1, 0, 1, 0),
              scale: function(e) {
                return tileSize * Math.pow(2, e);
              }
            });


            map = L.map('pdfTaggingMarkUpMap', {
              minZoom: minZoom,
              maxZoom: maxZoom,
              center: [0, 0], // - , -
              zoom: 1,
              crs: L.CRS.Screen,
              fullscreenControl: true,
              fullscreenControlOptions: { // optional
                title: "Full Screen",
                titleCancel: "Exit fullscreen mode"
              }
            });

            /*southWest = map.unproject([0, imgH], 2);
             northEast = map.unproject([imgW, 0], 2);*/
            southWest = map.unproject([0, imgH], minZoom);
            northEast = map.unproject([imgW, 0], minZoom);
            bounds = new L.LatLngBounds(southWest, northEast);

            tile_layer = L.tileLayer(constant.resourceUrl + '/' +
              scope.model.imagePath.substring(0, scope.model.imagePath.lastIndexOf('/')) + '/' +
              scope.model.imagePath.substring(scope.model.imagePath.lastIndexOf('/') + 1).replace(/\./g, '_') + '_tiles' +
              '/{z}/{x}_{y}.png',
              {
                minZoom: minZoom,
                maxZoom: maxZoom,
                // This map option disables world wrapping. by default, it is false.
                continuousWorld: false,
                // This option disables loading tiles outside of the world bounds.
                noWrap: true,
                tileSize: tileSize,
                bounds: bounds,
                maxNativeZoom: scope.maxNativeZoom
              })
              .addTo(map);
            //L.imageOverlay($filter('filePath')(resp.url), bounds).addTo(map);
            //map.setMaxBounds(bounds);
            //map.fitBounds(bounds);

            tile_layer.on("tileerror", function(e) {
              console.log("tileerror", e);
            });

            //var fitHeight = map.unproject([0, imgH], 0);

            map.setView([0.5, 0.5], minZoom);

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
              var id = utilFactory.newGuid();
              layer.id = id;
              var objLayer = layer.toGeoJSON();
              objLayer.comments = _.map(comments, function(cm) {
                return {
                  comment: cm.comment,
                  userId: cm.commentedBy,
                  author: cm.commenterContact ? cm.commenterContact.firstName + ' ' + cm.commenterContact.lastName : cm.commentedBy,
                  commentedDate: cm.commentedDate,
                  loadedComment: true
                };
              });
              objLayer.options = layer.options;
              objLayer._mRadius = layer._getLngRadius ? layer._getLngRadius() / 2 : 0;
              objLayer.r = layer._mRadius;
              objLayer.id = id;
              objLayer.type = type;
              objLayer.projectFileTag = e.projectFileTag;
              if(type === 'marker') {
                //var projectFileTagId = resp.data.tags[0].projectFileTagId;
                //objLayer.id = projectFileTagId;
                //layer.id = projectFileTagId;
                objLayer.layer = angular.copy(layer);
                scope.listLayers.push(objLayer);
                editableLayers.addLayer(layer);

                layer.bindPopup(markerTemplate, {
                  minWidth: 300
                });
                var markerScope;
                var compileMarker = function(cb) {
                  var isNewTag = false;
                  markerScope = scope.$new(true);
                  markerScope.marker = angular.copy(objLayer);
                  if(!objLayer.projectFileTag) {
                    // New tag
                    objLayer.projectFileTag = {
                      isNew: true,
                      projectFileTagId: utilFactory.newGuid(),
                      taskLinks: [],
                      comment: []
                    };
                    isNewTag = true;
                  }

                  markerScope.marker.remove = function() {
                    if(map.hasLayer(layer)) {
                      map.removeLayer(layer);
                    }
                    _.remove(scope.listLayers, {id: objLayer.id});
                    scope.updatePageData();
                  };
                  markerScope.marker.add = function() {
                    if(!objLayer.comments) {
                      objLayer.comments = [];
                    }
                    objLayer.comments.push(
                      {
                        comment: markerScope.marker.comment,
                        userId: $rootScope.currentUserInfo.userId,
                        author: $rootScope.currentUserInfo.contact.firstName + ' ' + $rootScope.currentUserInfo.contact.lastName,
                        commentedDate: new Date().toISOString(),
                        loadedComment: !isNewTag
                      });

                    markerScope.marker.comments = angular.copy(objLayer.comments);

                    //layer.closePopup();
                    if(isNewTag) {
                      // clear textbox
                      markerScope.marker.comment = "";
                      markerScope.add_comment_form.$setPristine();

                      scope.updatePageData();
                    }
                    else {
                      // Existing tag
                      // Add comment directly to tag
                      scope.addComment(objLayer.projectFileTag.projectFileTagId, markerScope.marker.comment)
                        .then(function() {
                          // clear textbox
                          markerScope.marker.comment = "";
                          markerScope.add_comment_form.$setPristine();

                          scope.updatePageData();
                        });
                    }
                  };

                  markerScope.marker.linkTask = function() {
                    $rootScope.currentProjectFileTag = objLayer.projectFileTag;
                    $rootScope.$broadcast('pdfTaggingMarkup.Tag.LinkTask');
                  };
                  markerScope.marker.isLinked = objLayer.projectFileTag.taskLinks.length > 0;
                  markerScope.marker.taskLink = objLayer.projectFileTag.taskLinks[0];
                  markerScope.marker.isNew = objLayer.projectFileTag.isNew;

                  markerScope.marker.unLink = function(task) {
                    $rootScope.$broadcast('pdfTaggingMarkup.Tag.UnLinkTask', {
                      projectFileTagId: objLayer.projectFileTag.projectFileTagId,
                      projectTaskId: task.taskId
                    });
                  };

                  markerScope.$on('linkTask.Completed', function(event, dt) {
                    if(objLayer.projectFileTag.projectFileTagId === dt.projectFileTag.projectFileTagId) {
                      markerScope.marker.isLinked = true;
                      markerScope.marker.taskLink = {
                        taskId: dt.taskId
                      };
                      e.projectFileTag.projectFileTagId = dt.projectFileTag.projectFileTagId;
                      e.projectFileTag.taskLinks = [{
                        taskId: dt.taskId
                      }];
                    }
                    scope.updatePageData();
                  });

                  markerScope.$on('unLinkTask.Completed', function(event, dt) {
                    if(objLayer.projectFileTag.projectFileTagId === dt.projectFileTag.projectFileTagId) {
                      markerScope.marker.isLinked = false;
                      markerScope.marker.taskLink = null;

                      e.projectFileTag.projectFileTagId = dt.projectFileTag.projectFileTagId;
                      e.projectFileTag.taskLinks = [];
                    }
                    scope.updatePageData();
                  });

                  $compile(layer._popup._contentNode)(markerScope);

                  if(cb) {
                    cb(markerScope, objLayer);
                  }
                };

                layer.on("popupopen", function(e) {
                  //// Reverse the popup if exceed the top
                  //// saving old anchor point X Y
                  //if(!e.popup.options.oldOffset) {
                  //  e.popup.options.oldOffset = e.popup.options.offset;
                  //}
                  //var px = map.project(e.popup._latlng);
                  //// we calculate popup content height (jQuery)
                  //var heightOpeningPopup = pdfTaggingMarkUpMap.querySelector('.leaflet-popup-content').offsetHeight;
                  //var temp = px.y - heightOpeningPopup;
                  //var temp2 = heightOpeningPopup + 42;
                  //if(temp < 100) { // if it will go above the world, we prevent it to do so
                  //  // we make the popup go below the poi instead of above
                  //  e.popup.options.offset = new L.Point(6, temp2);
                  //  // we make the popup tip to be pointing upward (jQuery)
                  //  $pdfTaggingMarkUpMap.addClass("reverse-popup");
                  //  e.popup.update();
                  //}
                  //else { // we allow auto pan if the popup can open in the normal upward way
                  //  e.popup.options.offset = e.popup.options.oldOffset;
                  //  e.popup.options.autoPan = true;
                  //  $pdfTaggingMarkUpMap.removeClass("reverse-popup");
                  //  e.popup.update();
                  //}
                  //
                  // Fix close button
                  var closeButton = pdfTaggingMarkUpMap.querySelector('.leaflet-popup-close-button');
                  if(closeButton) {
                    closeButton.setAttribute('href', '');
                    angular.element(closeButton).on('click', function() {
                      $timeout(function() {
                        $rootScope.selectedProjetFileTag = null;
                        $rootScope.$broadcast('pdfTaggingMarkup.popupclose');
                        scope.updatePageData();
                      });
                    });
                    layer.closeButton = closeButton;
                  }

                  // Compile popup content
                  compileMarker(function(markerScope) {
                    $timeout(function() {
                      if(markerScope.marker.isLinked) {
                        $rootScope.$broadcast('pdfTaggingMarkup.Tag.ViewTask', {
                          taskId: markerScope.marker.taskLink.taskId
                        });
                      }
                      $rootScope.$broadcast('pdfTaggingMarkup.popupopen');
                    });
                  });
                });

                layer.on("popupclose", function(e) {
                  // Update marker
                  var currentMarker = _.find(scope.listLayers, {id: objLayer.id});
                  if(currentMarker) {
                    currentMarker.text = markerScope.marker.text;
                  }

                  if(layer.closeButton) {
                    angular.element(layer.closeButton).off('click');
                  }

                  if(markerScope) {
                    markerScope.$destroy();
                  }

                  e.popup.options.autoPan = false;

                  $timeout(function() {
                    $rootScope.selectedProjetFileTag = null;
                    $rootScope.$broadcast('pdfTaggingMarkup.popupclose');
                  });

                  scope.updatePageData();
                });

                if(!hideOpenPopup) {
                  layer.openPopup();
                }
                else {
                  compileMarker(function() {
                    $timeout(function() {
                      $rootScope.$broadcast('pdfTaggingMarkup.popupopen');
                    });
                  });
                }

              }
              else {
                objLayer.layer = angular.copy(layer);
                objLayer.projectFileTag = e.projectFileTag;
                scope.listLayers.push(objLayer);
                editableLayers.addLayer(layer);
              }

              scope.updatePageData();
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

              scope.updatePageData();
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

              scope.updatePageData();
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

            map.on('zoomend', function(e) {
              scope.updatePageData();
            });

            if(scope.model.tagList) {
              _.each(scope.model.tagList, function(tag) {
                var attrs = tag.attributes;
                var type = _.filter(attrs, function(a) {
                  return a.key === 'type';
                });
                var options = _.reduce(attrs, function(memo, a) {
                  if(/^options\./.test(a.key)) {
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
                        return /^geo\./.test(a.key);
                      });
                      coords = _.reduce(geo, function(memo, g) {
                        var key = g.key,
                          value = parseFloat(g.value);
                        var info = key.split('.'), id = parseFloat(info[1]), id2 = parseFloat(info[2]);
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
                      rectangle.projectFileTag = tag;
                      onDrawCreated(rectangle, true, true);
                      break;
                    }
                    case 'polygon':
                    {
                      geo = _.filter(attrs, function(a) {
                        return /^geo\./.test(a.key);
                      });
                      coords = _.reduce(geo, function(memo, g) {
                        var key = g.key,
                          value = parseFloat(g.value);
                        var info = key.split('.'), id = parseFloat(info[1]), id2 = parseFloat(info[2]);
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
                      polygon.projectFileTag = tag;
                      onDrawCreated(polygon, true, true);
                      break;
                    }
                    case 'polyline':
                    {
                      geo = _.filter(attrs, function(a) {
                        return /^geo\./.test(a.key);
                      });
                      coords = _.reduce(geo, function(memo, g) {
                        var key = g.key,
                          value = parseFloat(g.value);
                        var info = key.split('.'), id = parseFloat(info[1]), id2 = parseFloat(info[2]);
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
                      polyline.projectFileTag = tag;
                      onDrawCreated(polyline, true, true);
                      break;
                    }
                    case 'circle':
                    {
                      var radius = _.filter(attrs, function(a) {
                        return /^radius/.test(a.key);
                      });
                      var circleRadius = 0;
                      if(radius.length) {
                        circleRadius = parseFloat(radius[0].value);
                      }
                      geo = _.filter(attrs, function(a) {
                        return /^geo\./.test(a.key);
                      });
                      coords = _.reduce(geo, function(memo, g) {
                        var key = g.key,
                          value = parseFloat(g.value);
                        var info = key.split('.'), id = parseFloat(info[1]), id2 = parseFloat(info[2]);
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
                      circle.projectFileTag = tag;
                      onDrawCreated(circle, true, true);
                      break;
                    }
                    case 'marker':
                    {
                      geo = _.filter(attrs, function(a) {
                        return /^geo\./.test(a.key);
                      });
                      coords = _.reduce(geo, function(memo, g) {
                        var key = g.key,
                          value = parseFloat(g.value);
                        var info = key.split('.'), id = parseFloat(info[1]), id2 = parseFloat(info[2]);
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
                      marker.projectFileTag = tag;

                      //var markerObj = {
                      //  id: markerCount++,
                      //  lat: lat,
                      //  lng: lng,
                      //  text: 'This is marker ' + markerCount
                      //};
                      //
                      //scope.markers.push(markerObj);

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

          scope.addTag = function(tags) {
            return onSiteFactory.addTags(tags);
          };

          scope.extractListTags = function(doc, docId) {
            //return _.map(doc.listLayer, function(m) {
            var layers = angular.copy(scope.listLayers);
            console.log(layers);
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
                var obj = {
                  'projectFileId': docId,
                  'projectFileTagId': null,
                  'parentFileTagId': null,
                  'tag': 'TAG',
                  'title': 'TAG',
                  'lattitude': m.layer ? m.layer.getLatLng().lat : m.geometry.coordinates[1],
                  'longitude': m.layer ? m.layer.getLatLng().lng : m.geometry.coordinates[0],
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
                      value: m.layer ? m.layer.getLatLng().lat : m.geometry.coordinates[1],
                      'projectFileTagAttributeId': null
                    },
                    {
                      key: 'geo.0.1',
                      value: m.layer ? m.layer.getLatLng().lng : m.geometry.coordinates[0],
                      'projectFileTagAttributeId': null
                    },
                    {
                      "key": "linkTaskId",
                      "value": m.projectFileTag ? m.projectFileTag.taskLinks.length ? m.projectFileTag.taskLinks[0].taskId : 0 : 0
                    }
                  ],
                  comment: listComment
                };
                return obj;
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
              }
              else {
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
                'tag': 'TAG',
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

          scope.updatePageData = function() {
            var listTag = scope.extractListTags(scope.selectedDoc, scope.selectedDoc.fileId);
            var newListTag = _.each(listTag, function(el) {
              //el.title = "Tag | Page-" + scope.pageNumber;
              _.remove(el.attributes, {"key": "page"});
              el.attributes.push({
                "key": "page",
                "value": scope.pageNumber
              });
              return el;
            });
            var layers = angular.copy(scope.listLayers);
            _.each(layers, function(l) {
              if(l.layer && l.layer._leaflet_events) {
                delete l.layer._leaflet_events;
              }
              if(l.layer && angular.isDefined(l.layer.editing)) {
                delete l.layer.editing;
              }
            });
            scope.model.tagList = newListTag;
            scope.model.layers = layers || [];
          };

          scope.$on('pdfTaggingMarkup.updateTileLayer.maxNativeZoom', function(e, v) {
            console.log('Data: ', v);
            console.log('Current page: ', scope.pageNumber);
            if(tile_layer && tile_layer.options.maxNativeZoom < v.maxNativeZoom && parseInt(scope.pageNumber) === v.page) {
              console.log('Redraw...');
              tile_layer.options.maxNativeZoom = v.maxNativeZoom;
              tile_layer.redraw();
            }
          });

          scope.$on('pdfTaggingMarkup.resize', function(e, v) {
            //if(v) {
            //  // hide comments
            //}
            //else {
            //  // show comments
            //}

            if(map) {
              $timeout(function() {
                scope.pdfTaggingMarkUp.containerHeight = elem[0].offsetHeight;
                scope.pdfTaggingMarkUp.containerWidth = elem[0].offsetWidth;
                map.invalidateSize(false);
                $timeout(function() {
                  scope.pdfTaggingMarkUp.containerHeight = elem[0].offsetHeight;
                  scope.pdfTaggingMarkUp.containerWidth = elem[0].offsetWidth;
                  map.invalidateSize(false);
                }, 50);
              }, 50);
            }
          });

          scope.getFileInfo()
            .success(render)
            .error(function(err) {
              console.log(err);
            });
        }
      };
    }]);

  return module;
});