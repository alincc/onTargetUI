var request = require('request');
var Promise = require('promise');
var config = require('./../config');
var exports = {};

exports.getDocumentById = function(id, projectId, baseRequest) {
  return new Promise(function(resolve, reject) {
    request({
      method: 'POST',
      body: {"projectFileId": id, projectId: projectId, "baseRequest": baseRequest},
      json: true,
      url: config.PROXY_URL + '/upload/getDocumentById'
    }, function(error, response, body) {
      if(!error && response.statusCode == 200) {
        resolve(response.body);
      } else {
        reject(response);
      }
    });
  });
};

exports.getDocumentTags = function(id, baseRequest) {
  return new Promise(function(resolve, reject) {
    request({
      method: 'POST',
      body: {"projectFileId": id, "baseRequest": baseRequest},
      json: true,
      url: config.PROXY_URL + '/project/file/tag/get'
    }, function(error, response, body) {
      if(!error && response.statusCode == 200) {
        resolve(response.body);
      } else {
        reject(response);
      }
    });
  });
};

module.exports = exports;