var config = require('./../config');
var Pusher = require('pusher');
var exports = {}, pusher;

module.exports = {
  init: function() {
    pusher = new Pusher({
      appId: config.pusher_appId,
      key: config.pusher_key,
      secret: config.pusher_secret,
      encrypted: true
    });
    pusher.port = 443;
  },
  Pusher: function() {
    return pusher;
  }
};