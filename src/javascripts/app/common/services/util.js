define(function(require) {
  'use strict';
  var angular = require('angular'),
    config = require('app/config'),
    countryServiceModule = require('app/common/services/country');
  var module = angular.module('common.services.util', ['app.config', 'common.services.country']);
  module.factory('utilFactory', ['countryFactory', '$q', '$http', 'appConstant', function(countryFactory, $q, $http,appConstant) {
    var services = {};
    /**
     * @param {DOMElement} element
     * @param {string} className
     * @returns {DOMElement} The closest parent of element matching the
     * className, or null.
     */
    services.getParentWithClass = function(e, className, depth) {
      depth = depth || 10;
      while(e.parentNode && depth--) {
        if(e.parentNode.classList && e.parentNode.classList.contains(className)) {
          return e.parentNode;
        }
        e = e.parentNode;
      }
      return null;
    };
    /**
     * @param {DOMElement} element
     * @param {string} className
     * @returns {DOMElement} The closest parent or self matching the
     * className, or null.
     */
    services.getParentOrSelfWithClass = function(e, className, depth) {
      depth = depth || 10;
      while(e && depth--) {
        if(e.classList && e.classList.contains(className)) {
          return e;
        }
        e = e.parentNode;
      }
      return null;
    };

    services.newGuid = function() {
      function guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      }

      return guid();
    };

    services.getFileExtension = function(filePath) {
      return filePath.substr(filePath.lastIndexOf('.') + 1);
    };

    services.generateAddress = function(addrObj) {
      var address = '', state, country, deferred = $q.defer();

      function cont() {
        if(addrObj.address1) {
          address += addrObj.address1 + ', ';
        }

        if(addrObj.city) {
          address += addrObj.city + ', ';
        }

        if(state) {
          address += state.name + ', ';
        } else {
          address += addrObj.state + ' ';
        }

        if(country) {
          address += country.name + ' ';
        } else {
          address += addrObj.country + ' ';
        }

        if(addrObj.zip) {
          address += addrObj.zip;
        }

        deferred.resolve(address);
      }

      if(addrObj.country) {
        country = countryFactory.getCountryByCode(addrObj.country);
      }

      if(country && addrObj.state) {
        countryFactory.getStateByCode(country.filename, addrObj.state)
          .then(function(resp) {
            state = resp;
            cont();
          }, cont);
      } else {
        cont();
      }

      return deferred.promise;
    };

    services.getWeather = function(zip) {
      return $http.get('https://app.ontargetcloud.com/data/2.5/weather', {
        params: {
          zip: zip,
          units: 'Imperial',
          APPID: appConstant.openWeatherMap.appId
        }
      });
    };

    services.getFileMimeType = function(fileType) {
      var extTypes = {
        "3gp": "video/3gpp",
        "a": "application/octet-stream",
        "ai": "application/postscript",
        "aif": "audio/x-aiff",
        "aiff": "audio/x-aiff",
        "asc": "application/pgp-signature",
        "asf": "video/x-ms-asf",
        "asm": "text/x-asm",
        "asx": "video/x-ms-asf",
        "atom": "application/atom+xml",
        "au": "audio/basic",
        "avi": "video/x-msvideo",
        "bat": "application/x-msdownload",
        "bin": "application/octet-stream",
        "bmp": "image/bmp",
        "bz2": "application/x-bzip2",
        "c": "text/x-c",
        "cab": "application/vnd.ms-cab-compressed",
        "cc": "text/x-c",
        "chm": "application/vnd.ms-htmlhelp",
        "class": "application/octet-stream",
        "com": "application/x-msdownload",
        "conf": "text/plain",
        "cpp": "text/x-c",
        "crt": "application/x-x509-ca-cert",
        "css": "text/css",
        "csv": "text/csv",
        "cxx": "text/x-c",
        "deb": "application/x-debian-package",
        "der": "application/x-x509-ca-cert",
        "diff": "text/x-diff",
        "djv": "image/vnd.djvu",
        "djvu": "image/vnd.djvu",
        "dll": "application/x-msdownload",
        "dmg": "application/octet-stream",
        "doc": "application/msword",
        "dot": "application/msword",
        "dtd": "application/xml-dtd",
        "dvi": "application/x-dvi",
        "ear": "application/java-archive",
        "eml": "message/rfc822",
        "eps": "application/postscript",
        "exe": "application/x-msdownload",
        "f": "text/x-fortran",
        "f77": "text/x-fortran",
        "f90": "text/x-fortran",
        "flv": "video/x-flv",
        "for": "text/x-fortran",
        "gem": "application/octet-stream",
        "gemspec": "text/x-script.ruby",
        "gif": "image/gif",
        "gz": "application/x-gzip",
        "h": "text/x-c",
        "hh": "text/x-c",
        "htm": "text/html",
        "html": "text/html",
        "ico": "image/vnd.microsoft.icon",
        "ics": "text/calendar",
        "ifb": "text/calendar",
        "iso": "application/octet-stream",
        "jar": "application/java-archive",
        "java": "text/x-java-source",
        "jnlp": "application/x-java-jnlp-file",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "js": "application/javascript",
        "json": "application/json",
        "log": "text/plain",
        "m3u": "audio/x-mpegurl",
        "m4v": "video/mp4",
        "man": "text/troff",
        "mathml": "application/mathml+xml",
        "mbox": "application/mbox",
        "mdoc": "text/troff",
        "me": "text/troff",
        "mid": "audio/midi",
        "midi": "audio/midi",
        "mime": "message/rfc822",
        "mml": "application/mathml+xml",
        "mng": "video/x-mng",
        "mov": "video/quicktime",
        "mp3": "audio/mpeg",
        "mp4": "video/mp4",
        "mp4v": "video/mp4",
        "mpeg": "video/mpeg",
        "mpg": "video/mpeg",
        "ms": "text/troff",
        "msi": "application/x-msdownload",
        "odp": "application/vnd.oasis.opendocument.presentation",
        "ods": "application/vnd.oasis.opendocument.spreadsheet",
        "odt": "application/vnd.oasis.opendocument.text",
        "ogg": "application/ogg",
        "p": "text/x-pascal",
        "pas": "text/x-pascal",
        "pbm": "image/x-portable-bitmap",
        "pdf": "application/pdf",
        "pem": "application/x-x509-ca-cert",
        "pgm": "image/x-portable-graymap",
        "pgp": "application/pgp-encrypted",
        "pkg": "application/octet-stream",
        "pl": "text/x-script.perl",
        "pm": "text/x-script.perl-module",
        "png": "image/png",
        "pnm": "image/x-portable-anymap",
        "ppm": "image/x-portable-pixmap",
        "pps": "application/vnd.ms-powerpoint",
        "ppt": "application/vnd.ms-powerpoint",
        "ps": "application/postscript",
        "psd": "image/vnd.adobe.photoshop",
        "py": "text/x-script.python",
        "qt": "video/quicktime",
        "ra": "audio/x-pn-realaudio",
        "rake": "text/x-script.ruby",
        "ram": "audio/x-pn-realaudio",
        "rar": "application/x-rar-compressed",
        "rb": "text/x-script.ruby",
        "rdf": "application/rdf+xml",
        "roff": "text/troff",
        "rpm": "application/x-redhat-package-manager",
        "rss": "application/rss+xml",
        "rtf": "application/rtf",
        "ru": "text/x-script.ruby",
        "s": "text/x-asm",
        "sgm": "text/sgml",
        "sgml": "text/sgml",
        "sh": "application/x-sh",
        "sig": "application/pgp-signature",
        "snd": "audio/basic",
        "so": "application/octet-stream",
        "svg": "image/svg+xml",
        "svgz": "image/svg+xml",
        "swf": "application/x-shockwave-flash",
        "t": "text/troff",
        "tar": "application/x-tar",
        "tbz": "application/x-bzip-compressed-tar",
        "tcl": "application/x-tcl",
        "tex": "application/x-tex",
        "texi": "application/x-texinfo",
        "texinfo": "application/x-texinfo",
        "text": "text/plain",
        "tif": "image/tiff",
        "tiff": "image/tiff",
        "torrent": "application/x-bittorrent",
        "tr": "text/troff",
        "txt": "text/plain",
        "vcf": "text/x-vcard",
        "vcs": "text/x-vcalendar",
        "vrml": "model/vrml",
        "war": "application/java-archive",
        "wav": "audio/x-wav",
        "wma": "audio/x-ms-wma",
        "wmv": "video/x-ms-wmv",
        "wmx": "video/x-ms-wmx",
        "wrl": "model/vrml",
        "wsdl": "application/wsdl+xml",
        "xbm": "image/x-xbitmap",
        "xhtml": "application/xhtml+xml",
        "xls": "application/vnd.ms-excel",
        "xlsx": "application/vnd.ms-excel",
        "xml": "application/xml",
        "xpm": "image/x-xpixmap",
        "xsl": "application/xml",
        "xslt": "application/xslt+xml",
        "yaml": "text/yaml",
        "yml": "text/yaml",
        "zip": "application/zip"
      };
      return extTypes[fileType] ? extTypes[fileType] : '';
    };

    services.makeId = function(l) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for(var i = 0; i < l; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
    };

    return services;
  }]);
  return module;
});
