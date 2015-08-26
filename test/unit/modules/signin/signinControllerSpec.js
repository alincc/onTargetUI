define(function(require) {
  'use strict';
  var angular = require('angular');
  //myProfileModule = require('app/modules/signin/signin'),
  //accountServiceModule = require('app/common/services/account'),
  //angularUtilsPagination = require('angularUtilsPagination'),
  //toaster = require('toaster'),
  //config = require('app/config'),
  //myProfileController, ctrl, scope, $state, appConstant, accountFactory, $templateCache, $compile, form, templateHtml;
  describe('Sign in controller', function() {

    it('test', function() {
      expect({}).to.be.an('object');
    });


    //// Config dependencies
    //beforeEach(module('angularUtils.directives.dirPagination'));
    //beforeEach(module('common.services.account'));
    //beforeEach(module('toaster'));
    //beforeEach(module('app.config'));
    //
    //// sign in module
    //beforeEach(module('app.signin'));
    //
    //beforeEach(function() {
    //  inject(function($rootScope, $controller, _$state_, _appConstant_, _accountFactory_, _$templateCache_, _$compile_) {
    //    scope = $rootScope.$new();
    //    $state = _$state_;
    //    appConstant = _appConstant_;
    //    accountFactory = _accountFactory_;
    //    $templateCache = _$templateCache_;
    //    $compile = _$compile_;
    //    myProfileController = function() {
    //      return $controller('SignInController', {
    //        $scope: scope,
    //        $state: _$state_,
    //        appConstant: _appConstant_,
    //        accountFactory: _accountFactory_
    //      });
    //    };
    //
    //    // Create controller
    //    ctrl = myProfileController();
    //
    //    // sign in template
    //    templateHtml = $templateCache.get('signin/templates/signin.html');
    //    $compile(templateHtml)(scope);
    //    form = scope.form;
    //  });
    //});
    //
    //it('should be a valid controller', function() {
    //  expect(ctrl).to.be.an('object');
    //});
    //
    //describe('$scope', function() {
    //  it('should has the user object', function() {
    //    expect(scope.user).to.deep.equal({
    //      username: '',
    //      password: ''
    //    });
    //  });
    //
    //  it('should has a form property', function() {
    //    expect(form).to.be.not.undefined;
    //  });
    //
    //  it('should has the app property', function() {
    //    expect(scope.app).to.deep.equal(appConstant.app);
    //  });
    //
    //  it('should has the signin method', function() {
    //    expect(scope.signin).to.be.a('function');
    //  });
    //});
  });
});