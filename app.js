var express = require("express");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var qs = require('querystring');
var methodOverride = require('method-override');
var _ = require('lodash');
var fs = require('fs');
var AWS = require('aws-sdk');

// Pusher Configuration
var pusher_appId = '138273';
var pusher_key = 'c2f5de73a4caa3763726';
var pusher_secret = 'e2455e810e36cbed510e';

var Pusher = require('pusher');
var pusher = new Pusher({
  appId: pusher_appId,
  key: pusher_key,
  secret: pusher_secret,
  encrypted: true
});
pusher.port = 443;
// End Pusher Configuration

// Amazon AWS SNS Configuration
var awsProfile = 'default';
var credentials = new AWS.SharedIniFileCredentials({profile: awsProfile});
AWS.config.credentials = credentials;
var sns = new AWS.SNS();
// End Amazon AWS SNS Configuration

var myArgs = process.argv.slice(2);
var port = myArgs[0] || 3214;
var folder = myArgs[1] || 'app';
var cors = require('cors');
var app = express();
var API_SERVER = 'http://int.api.ontargetcloud.com:8080/ontargetrs/services';
var BIM_SERVER = 'http://216.14.121.204:8080';

// Config
app.set('port', port);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride());
app.use(cors());
app.use(express.static(__dirname + '/' + folder));

// Push implementation
function getUserDetails(userId, cb) {
  request({
      method: 'POST',
      body: {"userId": userId, "accountStatus": null},
      json: true,
      url: API_SERVER + '/profile/getUserDetails'
    },
    function(error, response, body) {
      if(!error && response.statusCode == 200) {
        cb(response.body.user);
      }
    });
}

function getTaskDetails(taskId, baseRequest, cb) {
  request({
      method: 'POST',
      body: {"taskId": taskId, "baseRequest": baseRequest},
      json: true,
      url: API_SERVER + '/task/getTaskDetail'
    },
    function(error, response, body) {
      if(!error && response.statusCode == 200) {
        cb(response.body.task);
      } else {
        console.log(error);
      }
    });
}

function getDocumentTemplateName(docTemplateId) {
  var docTemplates = {
    "1": "Purchase Order",
    "2": "Change Order",
    "3": "Request For Information",
    "4": "Transmittal"
  };
  return docTemplates[docTemplateId];
}

function channel(projectId, userId) {
  return 'private-project-' + projectId + ':user-' + userId;
}

function sendPushNotification(endpointArn, message) {
  var payload = {
    default: message,
    APNS: {
      aps: {
        alert: message,
        sound: 'default',
        badge: 1
      }
    }
  };

  // first have to stringify the inner APNS object...
  payload.APNS = JSON.stringify(payload.APNS);
  // then have to stringify the entire message payload
  payload = JSON.stringify(payload);

  console.log('Sending push...');
  sns.publish({
    Message: payload,
    MessageStructure: 'json',
    TargetArn: endpointArn
  }, function(err, data) {
    if(err) {
      console.log(err.stack);
      return;
    }
    console.log('Push sent!');
  });
}

// Task assign
app.post('/ontargetrs/services/task/assignUserToTask', function(req, res) {
  var data = req.body,
    taskId = req.body.taskId,
    baseRequest = req.body.baseRequest;

  function assignUserToTask() {
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/task/assignUserToTask'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  getTaskDetails(taskId, baseRequest, function(task) {
    assignUserToTask();
    getUserDetails(baseRequest.loggedInUserId, function(user1) {
      // remove owner
      if(_.indexOf(req.body.members, req.body.ownerId) === -1) {
        //  pusher.trigger('onTarget', 'private-user-' + req.body.ownerId, {
        //    "message": "You has been removed from task " + response.body.task.title
        //  });
      }
      // add owner
      else {
        var assignees = _.difference(data.members, _.map(task.assignee, function(el) {
          return el.userId;
        }));
        _.each(assignees, function(el) {
          getUserDetails(el, function(user2) {
            var taskAssignee = _.map(task.assignee, function(el) {
              return el.userId;
            });
            taskAssignee.push(el);
            var d = _.uniq(taskAssignee);
            _.each(d, function(el2) {
              pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el2), {
                "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has assigned ' + task.title + ' to ' + user2.contact.firstName + ' ' + user2.contact.lastName
              });
            });
          });
        });
      }
    });
  });
});

// Task update/create
app.post('/ontargetrs/services/task/addTask', function(req, res) {
  var task = req.body.task,
    baseRequest = req.body.baseRequest,
    taskStatuses = JSON.parse(fs.readFileSync(__dirname + '/' + folder + '/javascripts/app/common/resources/taskStatuses.json', 'utf8'));

  function createUpdateTask() {
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/task/addTask'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  // Update task
  if(task.projectTaskId) {
    getTaskDetails(task.projectTaskId, req.body.baseRequest, function(beforeUpdateTask) {
      createUpdateTask();
      getUserDetails(baseRequest.loggedInUserId, function(user1) {
        var assignees = beforeUpdateTask.assignee;

        // Task status notification
        if(beforeUpdateTask.status !== task.status) {
          var taskNewStatus = _.find(taskStatuses, {id: task.status});
          _.each(assignees, function(el) {
            pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el.userId), {
              "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has changed the status of task to ' + (taskNewStatus ? taskNewStatus.name : task.status)
            });
          });
        }

        // Task edit notification
        _.each(assignees, function(el) {
          pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el.userId), {
            "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has made an updated ' + task.title
          });
        });
      });
    });
  } else {
    // Create task
    createUpdateTask();
    getUserDetails(baseRequest.loggedInUserId, function(user1) {
      _.each(task.assignees, function(el) {
        getUserDetails(el, function(user2) {
          pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el), {
            "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has assigned ' + task.title + ' to ' + user2.contact.firstName + ' ' + user2.contact.lastName
          });
        });
      });
    });
  }
});

// Add Task comment
app.post('/ontargetrs/services/task/addComment', function(req, res) {
  var data = req.body,
    baseRequest = req.body.baseRequest;

  function addTaskComment(data) {
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/task/addComment'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          //getUserDetails(baseRequest.loggedInUserId, function(user) {
          //
          //});

          pusher.trigger('onTarget', 'project-' + baseRequest.loggedInUserProjectId + ':onTime:task-' + req.body.taskId, {
            "name": "onTimeAddComment",
            "value": {
              "comment": response.body.taskComment.comment,
              "commentedBy": response.body.taskComment.commentedBy,
              "commentedDate": data.commentedDate,
              "taskCommentId": response.body.taskComment.taskCommentId,
              "taskId": response.body.taskComment.taskId,
              "commenterContact": response.body.taskComment.commenterContact
            }
          });

          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  addTaskComment(data);

  getTaskDetails(data.taskId, baseRequest, function(task) {
    getUserDetails(baseRequest.loggedInUserId, function(user1) {
      var assignees = task.assignee;
      _.each(assignees, function(el) {
        pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el.userId), {
          "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has commented on ' + task.title
        });
      });
    });
  });
});

// Add Task attachment
app.post('/ontargetrs/services/task/saveTaskFile', function(req, res) {
  var data = req.body,
    baseRequest = req.body.baseRequest;

  function addTaskAttachment() {
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/task/saveTaskFile'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  addTaskAttachment();

  getTaskDetails(data.taskId, baseRequest, function(task) {
    getUserDetails(baseRequest.loggedInUserId, function(user1) {
      var assignees = task.assignee;
      _.each(assignees, function(el) {
        pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el.userId), {
          "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has made an attachment on ' + task.title
        });
      });
    });
  });
});

// Add onSite document
app.post('/ontargetrs/services/upload/saveUploadedDocsInfo', function(req, res) {
  var data = req.body,
    baseRequest = req.body.baseRequest;

  function saveUploadedDocsInfo() {
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/upload/saveUploadedDocsInfo'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  function getProjectMembers(projectId, cb) {
    request({
        method: 'POST',
        body: {baseRequest: baseRequest, projectId: projectId},
        json: true,
        url: API_SERVER + '/project/getProjectMembers'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          cb(response.body);
        }
      });
  }

  saveUploadedDocsInfo();

  getUserDetails(baseRequest.loggedInUserId, function(user1) {
    getProjectMembers(baseRequest.loggedInUserProjectId, function(pmData) {
      _.each(pmData.projectMemberList, function(el) {
        pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el.userId), {
          "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has uploaded ' + data.name.substring(data.name.lastIndexOf('/') + 1)
        });
      })
    });
  });
});

// Add onSite document comment
app.post('/ontargetrs/services/upload/addComment', function(req, res) {
  var data = req.body,
    baseRequest = req.body.baseRequest;

  function addComment(data) {
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/upload/addComment'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          getUserDetails(baseRequest.loggedInUserId, function(user) {
            pusher.trigger('onTarget', 'project-' + baseRequest.loggedInUserProjectId + ':onSite-' + data.projectFileId, {
              "name": "onSiteAddComment",
              "value": response.body.comment
            });
          });
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  function getTaskComments(cb) {
    request({
        method: 'POST',
        body: {"projectFileId": data.projectFileId, "baseRequest": baseRequest},
        json: true,
        url: API_SERVER + '/upload/projectFileCommentList'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          cb(response.body);
        }
      });
  }

  function getProjectDetails(projectId, cb) {
    request({
        method: 'POST',
        body: {"projectId": projectId, "baseRequest": baseRequest},
        json: true,
        url: API_SERVER + '/project/getProject'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          cb(response.body.project);
        }
      });
  }

  addComment(data);

  getTaskComments(function(taskComments) {
    // commenters
    var userList = _.map(taskComments.comments, function(el) {
      return el.commentedBy;
    });

    // current user
    userList.push(baseRequest.loggedInUserId);

    // File owner id
    userList.push(data.fileOwnerId);

    getProjectDetails(baseRequest.loggedInUserProjectId, function(project) {
      // Project owner
      userList.push(project.projectOwnerId);
      getUserDetails(baseRequest.loggedInUserId, function(user1) {
        var d = _.uniq(userList);
        _.each(d, function(el) {
          pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el), {
            "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has commented on the ' + data.fileName.substring(data.fileName.lastIndexOf('/') + 1)
          });
        });
      });
    })
  });
});

// Add onFile documents
app.put('/ontargetrs/services/document', function(req, res) {
  function addDocument(data) {
    request({
        method: 'PUT',
        body: data,
        json: true,
        url: API_SERVER + '/document'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          notifications(data);
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  function notifications(data) {
    switch(data.documentTemplateId) {
      case "1":
        poNotification(data);
        break;
      case "2":
        coNotification(data);
        break;
      case "3":
        rfiNotification(data);
        break;
      case "4":
        trNotification(data);
        break;
    }
  }

  function coNotification(data) {
    var receiver = _.filter(data.keyValues, function(el) {
      return el.key === 'receiverId' || el.key === 'username';
    })[0];
    if(receiver) {
      getUserDetails(data.submittedBy, function(user) {
        console.log('Sending notifications: ', channel(data.baseRequest.loggedInUserProjectId, receiver.value));
        pusher.trigger('onTarget', channel(data.baseRequest.loggedInUserProjectId, receiver.value), {
          "message": "Change Order has been submitted by " + user.contact.firstName + " " + user.contact.lastName + " for your review"
        });
      });
    }
  }

  function rfiNotification(data) {
    var attention = [], receiverId;
    _.each(data.keyValues, function(el) {
      if(/^attention\d+/.test(el.key)) {
        attention.push(el.value);
      } else if(el.key === 'receiverId' || el.key === 'username') {
        receiverId = el.value;
      }
    });

    getUserDetails(data.submittedBy, function(user) {
      if(receiverId) {
        // Send notification to receiver
        console.log('Sending notifications: ', channel(data.baseRequest.loggedInUserProjectId, receiverId));
        pusher.trigger('onTarget', channel(data.baseRequest.loggedInUserProjectId, receiverId), {
          "message": "RFI has been submitted by " + user.contact.firstName + " " + user.contact.lastName + " for your review"
        });
      }
      // Send notifications to attention
      _.each(_.uniq(attention), function(el) {
        console.log('Sending notifications: ', channel(data.baseRequest.loggedInUserProjectId, el));
        pusher.trigger('onTarget', channel(data.baseRequest.loggedInUserProjectId, el), {
          "message": "RFI has been submitted by " + user.contact.firstName + " " + user.contact.lastName
        });
      });
    });
  }

  function poNotification(data) {
    var receiver = _.filter(data.keyValues, function(el) {
      return el.key === 'receiverId' || el.key === 'username';
    })[0];
    if(receiver) {
      getUserDetails(data.submittedBy, function(user) {
        console.log('Sending notifications: ', channel(data.baseRequest.loggedInUserProjectId, receiver.value));
        pusher.trigger('onTarget', channel(data.baseRequest.loggedInUserProjectId, receiver.value), {
          "message": "PO has been submitted by " + user.contact.firstName + " " + user.contact.lastName + " for your review"
        });
      });
    }
  }

  function trNotification(data) {
    var receiver = _.filter(data.keyValues, function(el) {
      return el.key === 'receiverId' || el.key === 'username';
    })[0];
    if(receiver) {
      getUserDetails(data.submittedBy, function(user) {
        console.log('Sending notifications: ', channel(data.baseRequest.loggedInUserProjectId, receiver.value));
        pusher.trigger('onTarget', channel(data.baseRequest.loggedInUserProjectId, receiver.value), {
          "message": "Transmittal has been submitted by " + user.contact.firstName + " " + user.contact.lastName + " for your review"
        });
      });
    }
  }

  addDocument(req.body);
});

// Update document status
app.post('/ontargetrs/services/document/status', function(req, res) {
  var baseRequest = req.body.baseRequest;
  var data = req.body;

  function updateStatus(data) {
    request({
        method: 'POST',
        body: data,
        json: true,
        url: API_SERVER + '/document/status'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          pushNotification(data);
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  function getProjectMembers(projectId, cb) {
    request({
        method: 'POST',
        body: {baseRequest: baseRequest, projectId: projectId},
        json: true,
        url: API_SERVER + '/project/getProjectMembers'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          cb(response.body);
        }
      });
  }

  function pushNotification(data) {
    getDocument(data.documentId, function(document) {
      getUserDetails(baseRequest.loggedInUserId, function(user) {
        var actionText = data.newStatus === 'APPROVED' ? 'Approved' : 'Rejected';
        var parsedKeyValues = {}, attention = [];

        _.each(document.keyValues, function(el) {
          if(/^attention\d+/.test(el.key)) {
            attention.push(el.value);
          }
          else {
            var value = el.value;
            if(el.key === 'date_created' || el.key === 'date' || el.key === 'received_by_date' || el.key === 'sent_by_date' || el.key === 'due_by_date') {
              value = new Date(el.value);
            }
            parsedKeyValues[el.key] = value;
          }
        });

        parsedKeyValues['attention'] = attention;

        if(parsedKeyValues.receiverId || parsedKeyValues.username) {
          // Receiver
          attention.push(parsedKeyValues.receiverId ? parsedKeyValues.receiverId : parsedKeyValues.username);
        }

        // Creator
        attention.push(document.createdBy);

        switch(document.documentTemplate.documentTemplateId) {
          case 1: // PO
            // Send notifications
            _.each(attention, function(el) {
              console.log('Sending notifications: ', channel(baseRequest.loggedInUserProjectId, el));
              pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el), {
                "message": user.contact.firstName + " " + user.contact.lastName + " has " + actionText + " the PO"
              });
            });
            break;
          case 2: // CO
            // Send notifications
            _.each(attention, function(el) {
              console.log('Sending notifications: ', channel(baseRequest.loggedInUserProjectId, el));
              pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el), {
                "message": user.contact.firstName + " " + user.contact.lastName + " has " + actionText + " the Change Order"
              });
            });
            break;
          case 3: // RFI
            // Send notifications
            _.each(attention, function(el) {
              console.log('Sending notifications: ', channel(baseRequest.loggedInUserProjectId, el));
              pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el), {
                "message": user.contact.firstName + " " + user.contact.lastName + " has " + actionText + " the RFI"
              });
            });
            break;
          case 4: // TR
            // Send notifications
            _.each(attention, function(el) {
              console.log('Sending notifications: ', channel(baseRequest.loggedInUserProjectId, el));
              pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el), {
                "message": user.contact.firstName + " " + user.contact.lastName + " has " + actionText + " the Transmittal"
              });
            });
            break;
        }
      });
    });
  }

  function getDocument(documentId, cb) {
    request({
        method: 'POST',
        body: {baseRequest: baseRequest, dcoumentId: documentId},
        json: true,
        url: API_SERVER + '/document/getDocument'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          cb(response.body.document);
        }
      });
  }

  updateStatus(data);
});

// Add RFI Response
app.put('/ontargetrs/services/document/response/save', function(req, res) {
  var data = req.body;
  var baseRequest = req.body.baseRequest;

  function addResponse(data) {
    request({
        method: 'PUT',
        body: req.body,
        json: true,
        url: API_SERVER + '/document/response/save'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          notifications(data);
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  function getDocument(documentId, cb) {
    request({
        method: 'POST',
        body: {baseRequest: baseRequest, dcoumentId: documentId},
        json: true,
        url: API_SERVER + '/document/getDocument'
      },
      function(error, response, body) {
        if(!error && response.statusCode == 200) {
          cb(response.body.document);
        }
      });
  }

  function notifications(data) {
    getDocument(data.documentId, function(document) {
      var parsedKeyValues = {}, attention = [];
      _.each(document.keyValues, function(el) {
        if(/^attention\d+/.test(el.key)) {
          attention.push(el.value);
        } else {
          var value = el.value;
          if(el.key === 'date_created' || el.key === 'date' || el.key === 'received_by_date' || el.key === 'sent_by_date' || el.key === 'due_by_date') {
            value = new Date(el.value);
          }
          parsedKeyValues[el.key] = value;
        }
      });
      parsedKeyValues['attention'] = attention;

      if(parsedKeyValues.receiverId || parsedKeyValues.username) {
        // Receiver
        attention.push(parsedKeyValues.receiverId ? parsedKeyValues.receiverId : parsedKeyValues.username);
      }

      // Creator
      attention.push(document.createdBy);

      getUserDetails(baseRequest.loggedInUserId, function(user) {
        var d = _.uniq(attention);
        _.each(d, function(el) {
          pusher.trigger('onTarget', channel(baseRequest.loggedInUserProjectId, el), {
            "message": user.contact.firstName + " " + user.contact.lastName + " has replied to the RFI"
          });
        });
      });
    });
  }

  addResponse(data);
});

// Add bim comment
app.post('/ontargetrs/services/bim/comment/save', function(req, res) {
  var data = req.body,
    baseRequest = req.body.baseRequest;

  request({
      method: 'POST',
      body: req.body,
      json: true,
      url: API_SERVER + '/bim/comment/save'
    },
    function(error, response, body) {
      if(!error && response.statusCode == 200) {
        res.send(response.body);
        pusher.trigger('onTarget', 'project-' + baseRequest.loggedInUserProjectId + ':onBIM-' + data.projectBIMFileId, {
          "name": "onBIMAddComment",
          "value": response.body.projectBIMFileComment
        });
      } else {
        res.send(error);
      }
    });
});

// onTarget services
app.put('/ontargetrs/services*', function(req, res) {
  //var r = request.post({headers: req.headers, uri: API_SERVER + req.params[0], json: req.body});
  //req.pipe(r).pipe(res);
  var url = API_SERVER + req.params[0];
  if(qs.stringify(req.query) !== "") {
    url += '?' + qs.stringify(req.query);
  }
  console.log('PUT request: ', API_SERVER + req.params[0]);
  req.pipe(request({
    url: url,
    method: req.method,
    json: req.body//,
    //headers: req.headers
  }, function(error, response, body) {
    if(error && error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else {
      throw error;
    }
  }), {end: false}).pipe(res);
});

app.post('/ontargetrs/services*', function(req, res) {
  //var r = request.post({headers: req.headers, uri: API_SERVER + req.params[0], json: req.body});
  //req.pipe(r).pipe(res);
  var url = API_SERVER + req.params[0];
  if(qs.stringify(req.query) !== "") {
    url += '?' + qs.stringify(req.query);
  }
  console.log(API_SERVER + req.params[0]);
  req.pipe(request({
    url: url,
    method: req.method,
    json: req.body//,
    //headers: req.headers
  }, function(error, response, body) {
    if(error && error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else {
      throw error;
    }
  }), {end: false}).pipe(res);
});

app.get('/ontargetrs/services*', function(req, res) {
  var url = API_SERVER + req.params[0];
  if(qs.stringify(req.query) !== "") {
    url += '?' + qs.stringify(req.query);
  }
  console.log('GET request: ', url);
  req.pipe(request({
    url: url,
    method: 'GET'//,
    //headers: req.headers
  }, function(error, response, body) {
    if(error && error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else {
      throw error;
    }
  })).pipe(res);
});

// onTarget BIM proxies
app.post('/bim*', function(req, res) {
  var url = BIM_SERVER + req.params[0];
  if(qs.stringify(req.query) !== "") {
    url += '?' + qs.stringify(req.query);
  }
  console.log(BIM_SERVER + req.params[0]);
  req.pipe(request({
    url: url,
    method: req.method,
    json: req.body//,
    //headers: req.headers
  }, function(error, response, body) {
    if(error && error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else {
      throw error;
    }
  }), {end: false}).pipe(res);
});

app.get('/bim*', function(req, res) {
  var url = BIM_SERVER + req.params[0];
  if(qs.stringify(req.query) !== "") {
    url += '?' + qs.stringify(req.query);
  }
  console.log('GET request: ', url);
  req.pipe(request({
    url: url,
    method: 'GET'//,
    //headers: req.headers
  }, function(error, response, body) {
    if(error && error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else {
      throw error;
    }
  })).pipe(res);
});

app.get('/', function(req, res) {
  res.sendFile("index.html");
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function(err) {
  if(err) {
    console.error('uncaughtException: ' + err.message);
    console.error(err.stack);
    //process.exit(1);             // exit with error
  }
});