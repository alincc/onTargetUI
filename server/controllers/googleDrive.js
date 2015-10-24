var request = require('request');
var qs = require('querystring');

function listFiles(req, res){
  var url = 'https://content.googleapis.com/drive/v2/files';
  if(qs.stringify(req.query) !== "") {
    url += '?' + qs.stringify(req.query);
  }
  console.log('List files: ' + url);

  req.pipe(request({
    url: url,
    method: 'GET'
  }, function(error, response, body){
    if(error && error.code === 'ECONNREFUSED') {
      console.error('Refused connection');
    } else {
      throw error;
    }
  })).pipe(res);
}
module.exports = {
  googleDrive: listFiles
};