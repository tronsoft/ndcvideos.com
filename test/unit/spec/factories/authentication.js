'use strict';

describe('Service: authentication', function () {

    var authentication, $httpBackend, BaseUrl, $http, loginSuccessfullResponse, logIn;

    beforeEach(function () {

        module('ndc');

        logIn = function logIn() {
            $httpBackend.expectPOST( BaseUrl + 'token', 'grant_type=password&username=Ali&password=password123',
                {
                    'Content-Type':'application/x-www-form-urlencoded',
                    'Accept':'application/json, text/plain, */*'
                }).respond(loginSuccessfullResponse);

            authentication.login('password', 'Ali', 'password123');
            $httpBackend.flush();
        };

        loginSuccessfullResponse = {
            "access_token":"take-on-me",
            "token_type":"bearer",
            "expires_in":1209599,
            "userName":"Ali",
            ".issued":"Mon, 14 Oct 2013 06:53:32 GMT",
            ".expires":"Mon, 28 Oct 2013 06:53:32 GMT"
        };

        inject(function (_authentication_, _$httpBackend_, _BaseUrl_, _$http_) {
            authentication = _authentication_;
            $httpBackend = _$httpBackend_;
            BaseUrl = _BaseUrl_;
            $http = _$http_;
        });

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return the current login state', function() {
        expect(authentication.isLoggedIn()).toBeFalsy();
    });

    it('should return undefined token when not logged in', function() {
        expect(authentication.getToken()).toBeUndefined();
    });

    it('should remember token', function() {
        logIn();
        expect(authentication.getToken()).toBe('take-on-me');
    });

    it('should not decorate requests not targeted at the API with token information', function() {
        logIn();
        $httpBackend.expectGET( 'external-api', {"Accept":"application/json, text/plain, */*"} ).respond();
        $http.get('external-api');
        $httpBackend.flush();
    });

    it('should decorate all subsequent requests to the API with the token information', function() {
        logIn();
        $httpBackend.expectGET( BaseUrl + 'test', {"Accept":"application/json, text/plain, */*","Authorization":"take-on-me"} ).respond();
        $http.get( BaseUrl + 'test' );
        $httpBackend.flush();
    });

    it('should indicate that the user is logged in', function() {
        logIn();
        expect(authentication.isLoggedIn()).toBeTruthy();
    });

    it('should reset information on logout', function() {
        logIn();
        authentication.logout();

        expect(authentication.getToken()).toBeUndefined();
        expect(authentication.isLoggedIn()).toBeFalsy();

        $httpBackend.expectGET( BaseUrl + 'test', {"Accept":"application/json, text/plain, */*"} ).respond();
        $http.get(BaseUrl + 'test', {"Accept":"application/json, text/plain, */*"});
        $httpBackend.flush();
    });

});