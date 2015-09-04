var Pusher = require('pusher');
var exports = {};
var pusher = new Pusher({
  appId: '138273',
  key: 'c2f5de73a4caa3763726',
  secret: 'e2455e810e36cbed510e',
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