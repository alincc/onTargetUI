/* istanbul ignore next */
// We will be using backend-less development
// $http uses $httpBackend to make its calls to the server
// $resource uses $http, so it uses $httpBackend too
// We will mock $httpBackend, capturing routes and returning data
define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    angularMocks = require('angularMocks'),
    angularResource = require('angularResource'),
    earnedValueReport = require('text!./../resources/mockData/earnedValueReport.json'),
    documentCategory = require('text!./../resources/mockData/documentCategory.json'),
    fileComment = require('text!./../resources/mockData/fileComment.json'),
    projectTask = require('text!./../resources/mockData/projectTask.json'),
    taskCountOfProject = require('text!./../resources/mockData/taskCountOfProject.json'),
    taskAttachment = require('text!./../resources/mockData/taskAttachment.json'),
    addComment = require('text!./../resources/mockData/addComment.json'),
    biReport = require('text!./../resources/mockData/biReport.json'),
    notifications = require('text!./../resources/mockData/notifications.json'),
    userDocument = require('text!./../resources/mockData/userDocument.json'),
    activityLog = require('text!./../resources/mockData/activityLog.json'),
    activityOfProject = require('text!./../resources/mockData/activityOfProject.json'),
    projectDetails = require('text!./../resources/mockData/projectDetails.json'),
    projectTaskFull = require('text!./../resources/mockData/projectTaskFull.json'),
    upload = require('text!./../resources/mockData/upload.json'),
    contact = require('text!./../resources/mockData/contact.json'),
    module;

  module = angular.module('common.services.mock', ['ngMockE2E', 'app.config', 'ngResource']);

  module.run(["$httpBackend", 'appConstant', '$resource', function($httpBackend, constant, $resource) {

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/notification\/getNotifications$/).respond(function(method, url, data) {
      return [200, angular.fromJson(notifications)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/project\/getProjectMembers/).respond(function(method, url, data) {
      return [200, angular.fromJson(contact)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/upload$/).respond(function(method, url, data) {
      return [200, angular.fromJson(upload)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/project\/getProject$/).respond(function(method, url, data) {
      return [200, angular.fromJson(projectDetails)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/project\/getActivityOfProject$/).respond(function(method, url, data) {
      return [200, angular.fromJson(activityOfProject)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/activityLog\/getLog$/).respond(function(method, url, data) {
      return [200, angular.fromJson(activityLog)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/documents\/getUserDocument$/).respond(function(method, url, data) {
      return [200, angular.fromJson(userDocument)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/report\/earnedValueReport$/).respond(function(method, url, data) {
      return [200, angular.fromJson(earnedValueReport)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/report\/bireport$/).respond(function(method, url, data) {
      return [200, angular.fromJson(biReport)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/upload\/projectFileCategoryList$/).respond(function(method, url, data) {
      return [200, angular.fromJson(documentCategory)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/upload\/projectFileCommentList$/).respond(function(method, url, data) {
      return [200, angular.fromJson(fileComment)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/upload\/saveUploadedDocsInfo$/).respond(function(method, url, data) {
      return [200, {
        "authenticated" : false,
        "responseCode" : "200",
        "returnMessage" : "SUCCESS",
        "returnVal" : "SUCCESS"
      }];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/upload\/addComment$/).respond(function(method, url, data) {
      return [200, {
        "authenticated" : false,
        "returnMessage" : "Comment added successfully",
        "returnVal" : "SUCCESS"
      }];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/task\/getProjectTaskList$/).respond(function(method, url, data) {
      return [200, angular.fromJson(projectTask)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/task\/getProjectTask$/).respond(function(method, url, data) {
      return [200, angular.fromJson(projectTaskFull)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/task\/addTask$/).respond(function(method, url, data) {
      return [200, {
        "authenticated": false,
        "returnMessage": "Successfully added task",
        "returnVal": "SUCCESS"
      }];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/task\/deleteTask$/).respond(function(method, url, data) {
      return [200, {
        "type" : "taskDetailResponse",
        "authenticated" : false,
        "returnMessage" : "Task deleted successfully",
        "returnVal" : "SUCCESS"
      }];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/tasks\/getTaskCountsOfProject$/).respond(function(method, url, data) {
      return [200, angular.fromJson(taskCountOfProject)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/task\/assignUserToTask$/).respond(function(method, url, data) {
      return [200, {
        "authenticated": false,
        "returnMessage": "Successfully assigned task",
        "returnVal": "SUCCESS"
      }];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/task\/getTaskAttachments$/).respond(function(method, url, data) {
      return [200, angular.fromJson(taskAttachment)];
    });

    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/task\/addComment$/).respond(function(method, url, data) {
      return [200, angular.fromJson(addComment)];
    });
    $httpBackend.whenPOST(/^http\:\/\/app.ontargetcloud.com:8080\/ontargetrs\/services\/task\/saveTaskFile$/).respond(function(method, url, data){
      return [200, {
        "type": "insertResponse",
        "authenticated": false,
        "returnMessage": "Successfully written",
        "returnVal": "SUCCESS",
        "id": 0
      }];
    });



    $httpBackend.whenGET(/.*/).passThrough();
    $httpBackend.whenPOST(/.*/).passThrough();
    $httpBackend.whenDELETE(/.*/).passThrough();
    $httpBackend.whenPUT(/.*/).passThrough();
    $httpBackend.whenPATCH(/.*/).passThrough();

    //// Ignore html files
    //$httpBackend.whenGET(/^.*\.html$/).passThrough();
    //
    //// Ignore json files
    //$httpBackend.whenGET(/.*\.json$/).passThrough();
    //
    //// Ignore image files
    //$httpBackend.whenGET(/.*\.jpg$/).passThrough();
    //
    //// Ignore GET request
    //$httpBackend.whenGET(function(str) {
    //  if (str.indexOf(constant.domain) > -1) {
    //    return true;
    //  }
    //  return false;
    //}).passThrough();
    //
    //// Ignore POST request
    //$httpBackend.whenPOST(function(str) {
    //  if (str.indexOf(constant.domain) > -1) {
    //    return true;
    //  }
    //  return false;
    //}).passThrough();
    //
    //// Ignore DELETE request
    //$httpBackend.whenDELETE(function(str) {
    //  if (str.indexOf(constant.domain) > -1) {
    //    return true;
    //  }
    //  return false;
    //}).passThrough();
    //
    //// Ignore https POST request
    //$httpBackend.whenPOST(function(str) {
    //  if (str.indexOf('https://') > -1) {
    //    return true;
    //  }
    //  return false;
    //}).passThrough();
    //
    //$httpBackend.whenGET(/\/api\/searchitems$/).respond(function(method, url, data) {
    //  var result = angular.fromJson(mockData);
    //
    //  var total = 0;
    //  var q = querySt("q", url), page = querySt("page", url), per_page = querySt("per_page", url);
    //
    //  if (q) {
    //    result = result.filter(function(el) {
    //      return el.item_code.toUpperCase().indexOf(q.toUpperCase()) > 0;
    //    });
    //  }
    //
    //  total = result.length;
    //  result = result.slice(per_page * (page - 1), per_page * (page - 1) + parseInt(per_page));
    //
    //  var results = {
    //    page: page,
    //    per_page: per_page,
    //    total: total,
    //    count: result.length,
    //    results: result
    //  };
    //  return [200, results, {}];
    //});
    //
    //$httpBackend.whenGET(/\/api\/replacements$/).respond(function(method, url, data) {
    //  var result = angular.fromJson(replacementData);
    //
    //  var total = 0;
    //  var itemId = querySt("itemId", url), page = querySt("page", url), per_page = querySt("per_page", url);
    //
    //  total = result.results.length;
    //  result.results = result.results.slice(per_page * (page - 1), per_page * (page - 1) + parseInt(per_page,10));
    //
    //  var results = {
    //    page: page,
    //    per_page: per_page,
    //    total: total,
    //    count: result.results.length,
    //    results: result
    //  };
    //  return [200, results, {}];
    //});
  }]);
  // Not used currently
  return module;
});


