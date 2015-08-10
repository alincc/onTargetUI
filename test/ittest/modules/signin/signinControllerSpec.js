define(function(require) {
  'use strict';
  var angular = require('angular'),
    myProfileModule = require('app/modules/signin/signin'),
    accountServiceModule = require('app/common/services/account'),
    myProfileController, ctrl, scope, $state, appConstant, accountFactory, $httpBackend, $templateCache, $compile, form, templateHtml;
  describe('My Profile controller', function() {
    beforeEach(module('app.signin'));
    beforeEach(module('common.services.account'));

    beforeEach(function() {
      inject(function($rootScope, $controller, _$state_, _appConstant_, _accountFactory_, _$httpBackend_, _$templateCache_, _$compile_) {
        scope = $rootScope.$new();
        $state = _$state_;
        appConstant = _appConstant_;
        accountFactory = _accountFactory_;
        $httpBackend = _$httpBackend_;
        $templateCache = _$templateCache_;
        $compile = _$compile_;
        myProfileController = function() {
          return $controller('SignInController', {
            $scope: scope,
            $state: _$state_,
            appConstant: _appConstant_,
            accountFactory: _accountFactory_
          });
        };

        // Create controller
        ctrl = myProfileController();

        // sign in template
        templateHtml = $templateCache.get('signin/templates/signin.html');
        $compile(templateHtml)(scope);
        form = scope.form;
      });
    });

    describe('sigin method', function() {
      it('should send a request', function() {
        var prisineCall = sinon.spy(form, '$setPristine');
        $httpBackend.expectPOST(appConstant.domain + 'user/signin').respond(200,
          {
            "type": "userLoginResponse",
            "authenticated": true,
            "returnMessage": "Successfully Authenticated",
            "returnVal": "SUCCESS",
            "token": "42198b45-05fa-4cd7-bc37-edbd9e63b314",
            "user": {
              "userId": 1
            }
          }
        );

        scope.signin({
          username: 'test',
          password: '123'
        });
        scope.$digest(); // Update values
        $httpBackend.flush();
        expect(prisineCall).to.have.been.called;
      });
    });
  });
});