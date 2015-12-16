define(function(require) {
  'use strict';
  var angular = require('angular'),
    _ = require('lodash'),
    config = require('app/config'),
    module;

  module = angular.module('common.directives.bim3dViewer', [
    'app.config'
  ]);

  module.directive('bim3dViewer', [
    'appConstant',
    '$rootScope',
    function(constant,
             $rootScope) {
      return {
        restrict: 'E',
        scope: {
          bimProject: '=',
          updateProperties: '&',
          setTreeView: '&',
          setTypesView: '&'
        },
        controller: [
          '$scope',
          'appConstant',
          'onBimFactory',
          function($scope,
                   appConstant,
                   onBimFactory) {
            $scope.getChunks = function() {
              return onBimFactory.getChunks($scope.bimProject.bimProjectJSONFilePath);
            };
          }],
        link: function(scope, elem) {
          var scene,
            virtualScene,
            stats,
            camera,
            renderer,
            element,
            container,
            properties,
            layers,
          //effect,
            controls,
            raycaster,
            mouse,
            clock,
            glFrame = elem[0],
            $scope = scope,
            types,
            rootobject,
            materials = [],
          //used for multi-material
            materialNames = {},
          //used for uniqueness;
            totalLoadpasses = 0,
            loadpass = 0,
          //the loader
            loader = new THREE.AssimpJSONLoader();

          function render(dt) {
            renderer.render(scene, camera);

            renderer.render(scene, camera);
            //switch to this for vr:
            //effect.render(scene, camera);
          }

          function resize() {
            var width = container.offsetWidth;
            var height = container.offsetHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
            //effect.setSize(width, height);
          }

          function update(dt) {
            resize();
            //
            controls.update(dt);
            camera.updateProjectionMatrix();
            stats.update();
            TWEEN.update();
          }

          function animate() {

            requestAnimationFrame(animate);

            update(clock.getDelta());
            render(clock.getDelta());
          }

          function fullscreen() {
            if(container.requestFullscreen) {
              container.requestFullscreen();
            } else if(container.msRequestFullscreen) {
              container.msRequestFullscreen();
            } else if(container.mozRequestFullScreen) {
              container.mozRequestFullScreen();
            } else if(container.webkitRequestFullscreen) {
              container.webkitRequestFullscreen();
            }
          }

          function getURL(url, callback) {
            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function() {
              if(xmlhttp.readyState === 4) {
                if(xmlhttp.status === 200) {
                  callback(JSON.parse(xmlhttp.responseText));
                }
                else {
                  console.log('We had an error, status code: ', xmlhttp.status);
                }
              }
            };

            xmlhttp.open('GET', url, true);
            xmlhttp.send();
          }

          function init(files) {
            //used for UI
            totalLoadpasses = files.length;
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.001, 2000);
            camera.position.set(50, 50, 50);
            scene.add(camera);
            container = glFrame;
            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            console.log(container.offsetWidth, container.offsetHeight);
            renderer.setSize(container.offsetWidth, container.offsetHeight);

            //bg color
            renderer.setClearColor(0x999999);

            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            element = renderer.domElement;

            container.appendChild(element);
            stats = new Stats();
            container.appendChild(stats.domElement);

            //effect = new THREE.StereoEffect(renderer);

            // Our initial control fallback with mouse/touch events in case DeviceOrientation is not enabled
            controls = new THREE.OrbitControls(camera, element);
            controls.target.set(
              camera.position.x + 5,
              camera.position.y,
              camera.position.z
            );
            controls.noPan = false;
            controls.noZoom = false;
            controls.staticMoving = false;
            controls.dynamicDampingFactor = 0.3;

            controls.keys = [65, 83, 68];
            function touchstart(event) {

              mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
              mouse.y = -( ( event.touches[0].clientY - 44 ) / window.innerHeight ) * 2 + 1;
              raycaster.setFromCamera(mouse, camera);

              var intersects = raycaster.intersectObjects(virtualScene.children, true);
              if(intersects.length > 0) {
                console.log(intersects[0].object.parent);
                scope.updateProperties({foo: intersects[0].object.parent});
                if(intersects[0].object.parent.name === "IfcMappedItem") {
                  scope.updateProperties({foo: intersects[0].object.parent.parent});
                }
                var tween = new TWEEN.Tween(controls.target).to(intersects[0].point, 250).start();
                tween.easing(TWEEN.Easing.Quadratic.InOut);

              }

            }

            function onMouseMove(event) {

              // calculate mouse position in normalized device coordinates
              // (-1 to +1) for both components

              mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
              mouse.y = -( ( event.clientY - 44 ) / window.innerHeight ) * 2 + 1;
              raycaster.setFromCamera(mouse, camera);

              var intersects = raycaster.intersectObjects(virtualScene.children, true);

              if(intersects.length > 0) {
                scope.updateProperties({foo: intersects[0].object.parent});
                if(intersects[0].object.parent.name === "IfcMappedItem") {
                  scope.updateProperties({foo: intersects[0].object.parent.parent});

                }
                var tween = new TWEEN.Tween(controls.target).to(intersects[0].point, 250).start();
                tween.easing(TWEEN.Easing.Quadratic.InOut);

              }

            }

            // Our preferred controls via DeviceOrientation
            function setOrientationControls(e) {
              if(!e.alpha) {
                return;
              }

              element.addEventListener('click', fullscreen, false);

              window.removeEventListener('deviceorientation', setOrientationControls, true);
            }

            window.addEventListener('deviceorientation', setOrientationControls, true);


            var lightScene = new THREE.PointLight(0xaaaaaa, 2, 100);
            lightScene.position.set(0, 20, 0);
            scene.add(lightScene);
            scene.add(new THREE.AmbientLight(0xaaaaaa));

            var floorTexture = THREE.ImageUtils.loadTexture('img/textures/wood.jpg');
            floorTexture.wrapS = THREE.RepeatWrapping;
            floorTexture.wrapT = THREE.RepeatWrapping;
            floorTexture.repeat = new THREE.Vector2(50, 50);
            floorTexture.anisotropy = renderer.getMaxAnisotropy();

            var floorMaterial = new THREE.MeshPhongMaterial({
              color: 0xffffff,
              specular: 0xffffff,
              shininess: 20,
              shading: THREE.FlatShading,
              map: floorTexture
            });

            var geometry = new THREE.PlaneBufferGeometry(1000, 1000);

            var floor = new THREE.Mesh(geometry, floorMaterial);
            floor.rotation.x = -Math.PI / 2;
            //      scene.add(floor);

            clock = new THREE.Clock();
            var onProgress = function(xhr) {
              if(xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete, 2) + '% downloaded');
              }
            };

            var onError = function(xhr) {
            };

            var geomaccum = new THREE.Geometry();

            var mlambert = new THREE.MeshLambertMaterial({color: 0xdddddd, transparent: true, opacity: 0.6});

            var loadObject = function(object) {
              loadpass++;
              if(loadpass === totalLoadpasses) {
                console.log("post-loading");
                //do this parsing stuff AFTER the whole tree is built up.
                //needs variable renaming
                console.log(" loaded, building mesh...");

                for(var i = 0; i < rootobject.flatrefs.length; i++) {
                  var node = rootobject.flatrefs[i];
                  //console.log(node.name);
                  //add the mesh
                  for(var j = 0; node.meshes && j < node.meshes.length; ++j) {

                    var idx = node.meshes[j];

                    //console.log("idx: "+ idx);
                    node.add(new THREE.Mesh(rootobject.meshes[idx], //  , rootobject.materials[ 0 ] ) ); //fixme later
                      rootobject.materials[rootobject.jsonMeshes[idx].materialindex]));
                    //console.log("mat for new mesh:" + rootobject.materials[ rootobject.meshes[ idx ].materialindex ] );
                    //obj.add( new THREE.Mesh( meshes[ idx ],
                    //materials[ json.meshes[ idx ].materialindex ] ) );
                  }

                  //place in scenegraph
                  if(i === 0) {
                    rootobject.add(node);
                  } else {
                    rootobject.flatrefs[node.mparent].add(node);
                  }

                  var temptype = node.name.split("_")[0];
                  if(types[temptype]) {
                    types[temptype].push(node);
                  } else {
                    types[temptype] = [];
                    types[temptype].push(node);
                  }

                }

                //console.log(rootobject.meshes);
                //console.log(rootobject.materials);
                rootobject.matrixWorldNeedsUpdate = true;
                rootobject.updateMatrix();
                var materialIndex = 0;

                rootobject.traverse(function(child) {
                  //console.log (child.name);
                  properties.push(child.name);
                  child.updateMatrixWorld();
                  controls.target.setFromMatrixPosition(child.matrixWorld);
                  if(child instanceof THREE.Mesh) {
                    if(child.material.name in materialNames) {

                      geomaccum.merge(child.geometry, child.matrixWorld, materialNames[child.material.name]);
                    } else {
                      geomaccum.merge(child.geometry, child.matrixWorld, materialIndex);
                      materialNames[child.material.name] = materialIndex;
                      materials.push(child.material);
                      materialIndex++;
                    }

                  }
                });


                var mesh = new THREE.Mesh(geomaccum, new THREE.MeshFaceMaterial(materials));
                //var mesh = new THREE.Mesh(geomaccum, new THREE.MeshFaceMaterial(materials));
                scene.add(mesh);
                //object.scale.multiplyScalar( 0.5 );
                //scene.add( object );
                virtualScene = rootobject;
                scope.setTreeView({scene: virtualScene});
                scope.setTypesView({typelist: types});
                //			    console.log(types);

                camera.lookAt(rootobject.matrixWorld);

                // Fire success loaded event
                $rootScope.$broadcast('bim3dViewer.loaded');
              }
            };

            rootobject = new THREE.Object3D();
            rootobject.meshes = [];
            rootobject.jsonMeshes = [];
            rootobject.materials = [];
            rootobject.flatrefs = [];
            //used to accumulate between multiple loader instances.

            properties = [];
            layers = [];
            types = {};

            for(var i = 0; i < files.length; i++) {

              console.log(files[i] + " loading...");
              loader.load(constant.newBimServer + '/' + files[i], rootobject,
                loadObject, onProgress, onError);
            }


            window.addEventListener('mousedown', onMouseMove, false);
            window.addEventListener('touchstart', touchstart, false);
            animate();
            //END INIT
          }

          $scope.getChunks()
            .then(function(resp) {
              if(resp.data.files.length > 0) {
                init(resp.data.files);
              } else {
                elem.html('<p>No chunk found.</p>');
              }
            });
        }
      };
    }]);

  return module.name;
});