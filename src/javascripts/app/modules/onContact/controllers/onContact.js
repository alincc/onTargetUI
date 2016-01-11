/**
 * Created by aashiskhanal on 9/2/15.
 */
define(function(require) {
    'use strict';
    var angular = require('angular');
    var controller = ['$scope', '$rootScope', '$q', 'onContactFactory', '$modal', 'storage', '$stateParams', '$location', 'appConstant', '$filter', 'utilFactory', '$sce', '$window',
        function($scope, $rootScope, $q, onContactFactory, $modal, storage, $stateParams, $location, appConstant, $filter, utilFactory, $sce, $window) {
            $scope.app = appConstant.app;
            $scope.isLoading = false;
            $scope.viewMode = "list";

            $scope.isPreview = angular.isDefined($stateParams.docId);

            $scope.selectedDoc = null;

            function arrangeData(data, itemPerRow) {
                var list = [];
                var row = [];
                _.forEach(data, function(dt, i) {
                    if(i > 0 && i % itemPerRow === 0) {
                        list.push(row);
                        row = [];
                    }
                    row.push(dt);
                    if(i === data.length - 1 && row.length > 0) {
                        list.push(row);
                    }
                });
                return list;
            }



            //list all document
            function getContactList() {
                $scope.isLoading = true;
                onContactFactory.getContactList($rootScope.currentProjectInfo.projectId,$rootScope.currentUserInfo.userId).
                    then(function(content) {
                        console.log(JSON.stringify(content));
                        $scope.isLoading = false;
                        var memberList = content.data.projectMemberList;

                        //angular.forEach(memberList, function (value, key) {
                        //    if (memberList[key].contact.userImagePath == null || memberList[key].contact.userImagePath == "") {
                        //        memberList[key].contact.userImagePath = '/images/ontargetassets/user.jpg';
                        //    }
                        //});
                        $scope.oncontacts = memberList;

                    }, function(error) {
                        $scope.isLoading = false;
                    });
            }

            $scope.$on('onContact.getContactList', function(){
                getContactList();
            });


            $scope.$broadcast('onContact.getContactList');


        }];
    return controller;


});


