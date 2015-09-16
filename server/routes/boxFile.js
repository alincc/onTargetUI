var request = require('request');
var qs = require('querystring');

function listFiles(req, res){

  var folderId = req.query.folderId, token = req.query.access_token;

  delete req.query.folderId;
  delete req.query.access_token;

  var url = 'https://api.box.com/2.0/folders/' + folderId + '/items';

  if(qs.stringify(req.query) !== "") {
    url += '?' + qs.stringify(req.query);
  }
  console.log('List files: ' + url);

  req.pipe(request({
    url: url,
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }, function(error, response, body){
    if(error && error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else {
      throw error;
    }
  })).pipe(res);
}

module.exports = function(app){
  app.get('/node/files/box', listFiles);
};