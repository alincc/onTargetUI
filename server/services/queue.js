var exports = {};
var queue = require('queue');
var config = require('./../config');
var queueInstance;

function init() {
  if(!queueInstance) {
    queueInstance = queue({concurrency: config.concurrencyImageProcesses});
  }
}

function add(fn) {
  queueInstance.push(fn);
  if(!queueInstance.running) {
    queueInstance.start();
  }
}

module.exports = {
  init: init,
  add: add
};