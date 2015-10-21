var request = require('request');
var qs = require('querystring');

function listFiles(req, res){

  var path = decodeURIComponent(req.query.path), token = req.query.access_token;

  delete req.query.path;
  delete req.query.access_token;

  var url = 'https://api.dropboxapi.com/1/metadata/auto' + path;

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

module.exports = {
  dropBox: listFiles
};