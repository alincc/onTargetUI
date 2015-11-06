var config = require('./../config');
var Pusher = require('pusher');
var exports = {};
var pusher = new Pusher({
  appId: config.pusher_appId,
  key: config.pusher_key,
  secret: config.pusher_secret,
  encrypted: true
});
pusher.port = 443;

//exports.notifications = function(app) {
//  app.post('/node/notifications', function(req, res) {
//    //var item = req.body;
//    pusher.trigger('onTarget', 'notifications', {
//      "message": "hello world"
//    });
//    res.send({
//      success: true
//    });
//  });
//};
//
//exports.trigger = function() {
//  pusher.trigger('onTarget', 'notifications', {
//    "message": "hello world"
//  });
//};

module.exports = pusher;