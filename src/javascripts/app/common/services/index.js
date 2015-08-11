define(function (require) {
    'use strict';
    var angular = require('angular'),
    //mock = require('./mock'),
        account = require('./account'),
        util = require('./util'),
        notifications = require('./notifications'),
        countriesResource = require('./countries');

    var module = angular.module('common.services',
        [
            //'common.services.mock',
            'common.services.notifications',
            'common.services.account',
            'common.services.util',
            'common.services.countries',
            'common.services.upload'
        ]);
    return module;
});