var path = require('path');
var fs = require("fs");
var request = require('request');
var mime = require('mime');
var gm = require('gm');
var _ = require('lodash');
var rootPath = process.env.ROOT;

function generateGuiId() {
  return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function exportPdf(req, res) {
  var imageUrl = req.body.path;
  var markerUrl = 'server/assets/img/marker-icon.png';
  var listGeo = req.body.geo;
  var zoom = req.body.scale;
  var exportFileName = req.body.fileName;
  var imgWidth, imgHeight;
  var projectAssetFolderName = req.body.projectAssetFolderName;
  var g = gm(path.join(rootPath, imageUrl)).size(function(err, size) {
    console.log(size, err);
    var randomId = generateGuiId();
    if(!err) {
      imgWidth = size.width;
      imgHeight = size.height;
      var scale = Math.pow(2, zoom);

      function getOpacityStr(opt) {
        return ('0' + Math.round((1 - opt) * 255).toString(16)).slice(-2);
      }

      for(var i = 0; i < listGeo.length; i++) {
        var type = listGeo[i].geometry.type;
        var coords = listGeo[i].geometry.coordinates;
        var style = listGeo[i].options;
        switch(type) {
          case "Polygon":
          {

            var newCoordsStrPolygon = _.map(coords[0], function(d) {
              d[0] = d[0] * scale;
              d[1] = d[1] * scale;
              d[1] = -d[1];
              return d.join(',')
            }).join(' ');
            g = g.fill(style.color + getOpacityStr(style.fillOpacity)).stroke(style.color + getOpacityStr(style.opacity), style.weight);
            g = g.draw('polygon', newCoordsStrPolygon);
            break;
          }
          case "LineString":
          {
            var newCoordsStrLine = _.map(coords, function(d) {
              d[0] = d[0] * scale;
              d[1] = d[1] * scale;
              d[1] = -d[1];
              return d.join(',')
            }).join(' ');
            g = g.fill('transparent').stroke(style.color + getOpacityStr(style.opacity), style.weight);
            g = g.draw('polyline', newCoordsStrLine);
            break;
          }
          case "Point":
          {
            var radius = listGeo[i]._mRadius || 0;
            radius = radius * 2 * scale;
            coords[0] = coords[0] * scale;
            coords[1] = coords[1] * scale;
            coords[1] = -coords[1];
            var coords2 = [coords[0] + radius, coords[1]];


            if(radius > 0) {
              g = g.fill(style.color + getOpacityStr(style.fillOpacity)).stroke(style.color + getOpacityStr(style.opacity), style.weight);
              g = g.draw('circle', coords.join(',') + ' ' + coords2.join(','));
            }
            else {
              // var imgPoint = gm('./../../assets/img/marker-icon.png');
              // console.log('marker')
              // g.in('-page', '+0+0')
              // .in('marker-icon.png')
            }
            break;
          }
        }
      }

      var destinationPath1 = path.join(rootPath, 'assets', 'temp', randomId);
      if(!fs.existsSync(destinationPath1)) {
        fs.mkdirSync(destinationPath1);
      }
      var tmpName = 'tmp_' + randomId + '.jpg';
      tmpName = path.join(destinationPath1, tmpName);


      var destinationPath = path.join(rootPath, 'assets', 'projects', projectAssetFolderName);
      if(!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath);
      }
      destinationPath = path.join(destinationPath, 'onsite');
      if(!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath);
      }
      destinationPath = path.join(destinationPath, exportFileName);

      var returningPath = 'assets/projects/' + projectAssetFolderName + '/onsite/' + exportFileName;

      g.write(tmpName, function() {
        var newG = gm()
          .in('-page', '+0+0')
          .in(tmpName);
        for(var i = 0; i < listGeo.length; i++) {
          var type = listGeo[i].geometry.type;
          var coords = listGeo[i].geometry.coordinates;
          if(listGeo[i].type === 'marker') {
            newG = newG.in('-page', '+' + coords[0] + '+' + coords[1])
              .in(markerUrl);
          }
        }

        newG.mosaic()  // Merges the images as a matrix
          .write(tmpName, function(err) {
            gm(tmpName).write(destinationPath, function() {
              res.send({
                success: true,
                path: returningPath
              });
            });
          });
      });
    }
  });
}

module.exports = {
  exportPdf: exportPdf
};