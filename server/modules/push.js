var pusherService = require('./../services/push');
var request = require('request');
var _ = require('lodash');
var config = require('./../config');
var PROXY_SERVER = config.PROXY_URL;

module.exports = function(app){
  // assign user request
  app.post('/ontargetrs/services/task/assignUserToTask', function(req, res, next){
    var taskId = req.body.taskId,
      baseRequest = req.body.baseRequest;
    request({
        method: 'POST',
        body: req.body,
        json: true,
        url: PROXY_SERVER + '/task/assignUserToTask'
      },
      function(error, response, body){
        console.log(response);
        if(!error && response.statusCode == 200) {
          res.send(response);
          if(req.body.ownerId && req.body.members) {
            var _response;
            request({
                method: 'POST',
                body: {"taskId": taskId, "baseRequest": baseRequest},
                json: true,
                url: PROXY_SERVER + '/task/getTaskDetail'
              },
              function(error, response, body){
                if(!error && response.statusCode == 200) {
                  console.log(response);
                  // remove owner
                  if(_.indexOf(req.body.members, req.body.ownerId) === -1) {
                    pusherService.trigger('onTarget', 'private-user-' + req.body.ownerId, {
                      "message": "You has been removed from task " + response.body.task.title
                    });
                  }
                  // add owner
                  else {
                    pusherService.trigger('onTarget', 'private-user-' + req.body.ownerId, {
                      "message": "You has been added to task " + response.body.task.title
                    });
                  }
                } else {
                  console.log(error);
                }
              });
          }
        } else {
          res.send(error);
        }
      });
  });
};