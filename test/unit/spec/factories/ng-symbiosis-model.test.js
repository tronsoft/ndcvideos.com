'use strict';

describe('ng-symbiosis-model', function () {

    var BaseModel, $httpBackend, $rootScope;

    beforeEach(function () {

        module('ngSymbiosis.model');

        inject(function (_BaseModel_, _$httpBackend_, _$rootScope_) {
            BaseModel = _BaseModel_;
            $httpBackend = _$httpBackend_;
            $rootScope = _$rootScope_;
        });

    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('$save', function () {
        it('should PUT its data on $save when it has an ID (update existing)', function() {
            $httpBackend.expectPUT('test-url/5', {title:'New title', id:5}).respond(200, {id: 5, title:'New title from server'});
            var model = new BaseModel({url:'test-url'}, {tracker:'Tracker'});

            model.title = 'New title';
            model.id = 5;

            var promise = model.$save();
            expect(model.$isSaving).toBeTruthy();
            $httpBackend.flush();
            expect(model.$isSaving).toBeFalsy();

            expect(model.title).toBe('New title from server');
            expect(typeof promise.then).toBe('function');
        });

        it('should POST its data on $save if does not have an ID (new)', function() {
            $httpBackend.expectPOST('test-url', {title:'New title'}).respond(200, {id: 5, title:'New title from server'});
            var model = new BaseModel({url:'test-url'}, {tracker:'Tracker'});
            model.title = 'New title';

            var promise = model.$save();
            $httpBackend.flush();

            expect(model.title).toBe('New title from server');
            expect(model.id).toBe(5);
            expect(typeof promise.then).toBe('function');
        });
    });

    describe('$set', function () {
        it('should throw if url is not specified', function() {
            function wrapper() {
                new BaseModel();
            }
            expect(wrapper).toThrow();
        });

        it('should load instance and override with new data', function() {
            var model = new BaseModel({url:'url', title: 'New title', id: 5});

            model.$set({id:1});

            expect(model.id).toBe(1);
            expect(model instanceof BaseModel).toBeTruthy();
        });

        it('should remove properties missing in new object', function() {
            var model = new BaseModel({url:'test-url', title: 'New title', id: 5});

            model.$set({id:1});

            expect(model.id).toBe(1);
            expect(model.title).toBeUndefined();
        });
    });

    describe('$delete', function () {
        it('should delete on $delete', function() {
            $httpBackend.expectDELETE('test-url/5').respond(200, {});

            var model = new BaseModel({url:'test-url', id: 5}, {tracker:'Tracker'});

            var promise = model.$delete();
            expect(model.$isDeleting).toBeTruthy();
            $httpBackend.flush();
            expect(model.$isDeleting).toBeFalsy();

            expect(typeof promise.then).toBe('function');
        });
    });

});
