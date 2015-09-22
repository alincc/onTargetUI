var express = require("express");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var qs = require('querystring');
var methodOverride = require('method-override');
var _ = require('lodash');
var fs = require('fs');

var Pusher = require('pusher');
var pusher = new Pusher({
  appId: '138273',
  key: 'c2f5de73a4caa3763726',
  secret: 'e2455e810e36cbed510e',
  encrypted: true
});
pusher.port = 443;

var myArgs = process.argv.slice(2);
var folder = myArgs[0] || 'app';
var port = myArgs[1] || 3214;
//var cors = require('cors');
var app = express();
var API_SERVER = 'http://app.ontargetcloud.com:8080/ontargetrs/services';

// Config
app.set('port', port);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride());
//app.use(cors());
app.use(express.static(__dirname + '/' + folder));

// Push implementation
function getUserDetails(userId, cb){
  request({
      method: 'POST',
      body: {"userId": userId, "accountStatus": null},
      json: true,
      url: API_SERVER + '/profile/getUserDetails'
    },
    function(error, response, body){
      if(!error && response.statusCode == 200) {
        cb(response.body.user);
      }
    });
}

function getTaskDetails(taskId, baseRequest, cb){
  request({
      method: 'POST',
      body: {"taskId": taskId, "baseRequest": baseRequest},
      json: true,
      url: API_SERVER + '/task/getTaskDetail'
    },
    function(error, response, body){
      if(!error && response.statusCode == 200) {
        cb(response.body.task);
      } else {
        console.log(error);
      }
    });
}

// Task assign
app.post('/ontargetrs/services/task/assignUserToTask', function(req, res){
  var data = req.body,
    taskId = req.body.taskId,
    baseRequest = req.body.baseRequest;

  function assignUserToTask(){
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/task/assignUserToTask'
      },
      function(error, response, body){
        if(!error && response.statusCode == 200) {
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  getTaskDetails(taskId, baseRequest, function(task){
    assignUserToTask();
    getUserDetails(baseRequest.loggedInUserId, function(user1){
      // remove owner
      if(_.indexOf(req.body.members, req.body.ownerId) === -1) {
        //  pusher.trigger('onTarget', 'private-user-' + req.body.ownerId, {
        //    "message": "You has been removed from task " + response.body.task.title
        //  });
      }
      // add owner
      else {
        var assignees = _.difference(data.members, _.map(task.assignee, function(el){
          return el.userId;
        }));
        _.each(assignees, function(el){
          getUserDetails(el, function(user2){
            var taskAssignee = _.map(task.assignee, function(el){
              return el.userId;
            });
            taskAssignee.push(el);
            var d = _.uniq(taskAssignee);
            _.each(d, function(el2){
              pusher.trigger('onTarget', 'private-user-' + el2, {
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
app.post('/ontargetrs/services/task/addTask', function(req, res){
  var task = req.body.task,
    baseRequest = req.body.baseRequest,
    taskStatuses = JSON.parse(fs.readFileSync(__dirname + '/' + folder + '/javascripts/app/common/resources/taskStatuses.json', 'utf8'));

  function createUpdateTask(){
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/task/addTask'
      },
      function(error, response, body){
        if(!error && response.statusCode == 200) {
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  // Update task
  if(task.projectTaskId) {
    getTaskDetails(task.projectTaskId, req.body.baseRequest, function(beforeUpdateTask){
      createUpdateTask();
      getUserDetails(baseRequest.loggedInUserId, function(user1){
        var assignees = beforeUpdateTask.assignee;

        // Task status notification
        if(beforeUpdateTask.status !== task.status) {
          var taskNewStatus = _.find(taskStatuses, {id: task.status});
          _.each(assignees, function(el){
            pusher.trigger('onTarget', 'private-user-' + el.userId, {
              "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has changed the status of task to ' + (taskNewStatus ? taskNewStatus.name : task.status)
            });
          });
        }

        // Task edit notification
        _.each(assignees, function(el){
          pusher.trigger('onTarget', 'private-user-' + el.userId, {
            "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has made an updated ' + task.title
          });
        });
      });
    });
  } else {
    // Create task
    createUpdateTask();
    getUserDetails(baseRequest.loggedInUserId, function(user1){
      _.each(task.assignees, function(el){
        getUserDetails(el, function(user2){
          pusher.trigger('onTarget', 'private-user-' + el, {
            "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has assigned ' + task.title + ' to ' + user2.contact.firstName + ' ' + user2.contact.lastName
          });
        });
      });
    });
  }
});

// Add Task comment
app.post('/ontargetrs/services/task/addComment', function(req, res){
  var data = req.body,
    baseRequest = req.body.baseRequest;

  function addTaskComment(){
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/task/addComment'
      },
      function(error, response, body){
        if(!error && response.statusCode == 200) {
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  addTaskComment();

  getTaskDetails(data.taskId, baseRequest, function(task){
    getUserDetails(baseRequest.loggedInUserId, function(user1){
      var assignees = task.assignee;
      _.each(assignees, function(el){
        pusher.trigger('onTarget', 'private-user-' + el.userId, {
          "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has commented on ' + task.title
        });
      });
    });
  });
});

// Add Task attachment
app.post('/ontargetrs/services/task/saveTaskFile', function(req, res){
  var data = req.body,
    baseRequest = req.body.baseRequest;

  function addTaskAttachment(){
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/task/saveTaskFile'
      },
      function(error, response, body){
        if(!error && response.statusCode == 200) {
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  addTaskAttachment();

  getTaskDetails(data.taskId, baseRequest, function(task){
    getUserDetails(baseRequest.loggedInUserId, function(user1){
      var assignees = task.assignee;
      _.each(assignees, function(el){
        pusher.trigger('onTarget', 'private-user-' + el.userId, {
          "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has made an attachment on ' + task.title
        });
      });
    });
  });
});

// Add onSite document
app.post('/ontargetrs/services/upload/saveUploadedDocsInfo', function(req, res){
  var data = req.body,
    baseRequest = req.body.baseRequest;

  function saveUploadedDocsInfo(){
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/upload/saveUploadedDocsInfo'
      },
      function(error, response, body){
        if(!error && response.statusCode == 200) {
          res.send(response.body);
        } else {
          res.send(error);
        }
      });
  }

  function getProjectMembers(projectId, cb){
    request({
        method: 'POST',
        body: {baseRequest: baseRequest, projectId: projectId},
        json: true,
        url: API_SERVER + '/project/getProjectMembers'
      },
      function(error, response, body){
        if(!error && response.statusCode == 200) {
          cb(response.body);
        }
      });
  }

  saveUploadedDocsInfo();

  getUserDetails(baseRequest.loggedInUserId, function(user1){
    getProjectMembers(baseRequest.loggedInUserProjectId, function(pmData){
      _.each(pmData.projectMemberList, function(el){
        pusher.trigger('onTarget', 'private-user-' + el.userId, {
          "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has uploaded ' + data.name.substring(data.name.lastIndexOf('/') + 1)
        });
      })
    });
  });
});

// Add onSite document comment
app.post('/ontargetrs/services/upload/addComment', function(req, res){
  var data = req.body,
    baseRequest = req.body.baseRequest;

  function addComment(){
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: API_SERVER + '/upload/addComment'
      },
      function(error, response, body){
        if(!error && response.statusCode == 200) {
          res.send(response.body.taskAttachments);
        } else {
          res.send(error);
        }
      });
  }

  function getTaskComments(cb){
    request({
        method: 'POST',
        body: {"projectFileId": data.projectFileId, "baseRequest": baseRequest},
        json: true,
        url: API_SERVER + '/upload/projectFileCommentList'
      },
      function(error, response, body){
        if(!error && response.statusCode == 200) {
          cb(response.body);
        }
      });
  }

  function getProjectDetails(projectId, cb){
    request({
        method: 'POST',
        body: {"projectId": projectId, "baseRequest": baseRequest},
        json: true,
        url: API_SERVER + '/project/getProject'
      },
      function(error, response, body){
        if(!error && response.statusCode == 200) {
          cb(response.body.project);
        }
      });
  }

  addComment();

  getTaskComments(function(taskComments){
    // commenters
    var userList = _.map(taskComments.comments, function(el){
      return el.commentedBy;
    });

    // current user
    userList.push(baseRequest.loggedInUserId);

    // File owner id
    userList.push(data.fileOwnerId);

    getProjectDetails(baseRequest.loggedInUserProjectId, function(project){
      // Project owner
      userList.push(project.projectOwnerId);
      getUserDetails(baseRequest.loggedInUserId, function(user1){
        var d = _.uniq(userList);
        _.each(d, function(el){
          pusher.trigger('onTarget', 'private-user-' + el, {
            "message": user1.contact.firstName + ' ' + user1.contact.lastName + ' has commented on the ' + data.fileName.substring(data.fileName.lastIndexOf('/') + 1)
          });
        });
      });
    })
  });
});

app.post('/ontargetrs/services*', function(req, res){
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
  }, function(error, response, body){
    if(error && error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else {
      throw error;
    }
  })).pipe(res);
});

app.get('/ontargetrs/services*', function(req, res){
  var url = API_SERVER + req.params[0];
  if(qs.stringify(req.query) !== "") {
    url += '?' + qs.stringify(req.query);
  }
  console.log(API_SERVER + req.params[0]);
  req.pipe(request({
    url: url,
    method: req.method//,
    //headers: req.headers
  }, function(error, response, body){
    if(error && error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else {
      throw error;
    }
  })).pipe(res);
});

app.get('/', function(req, res){
  res.sendfile("index.html");
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function(err){
  if(err) {
    console.error('uncaughtException: ' + err.message);
    console.error(err.stack);
    process.exit(1);             // exit with error
  }
});