/* jshint node: true */
/* global describe, it, beforeEach */
'use strict';

var assert = require('chai').assert;
var fs = require('fs');
var m  = require('../lib/index');
var bower = require('bower');
var Q = require('q');

function bowerSetup(bowerJson) {
  bowerJson = bowerJson || 'bower.json';
  var deferred = Q.defer();
  fs.writeFileSync('test/tmp/bower.json', fs.readFileSync('test/fixtures/'+bowerJson));
  bower.commands.prune().on('end', function () {
    bower.commands.install(null, null, { 'cwd': 'test/tmp/' }).on('end', function () {
      deferred.resolve();  
    });
  });
  return deferred.promise;
}

describe('Properties', function(){
  var manifest;
  beforeEach(function(done){
    bowerSetup().then(function () {
      manifest = m('./fixtures/manifest.json', {
        bowerJsonDirectory: './tmp/',
      });
      done();
    });
  });
  it('should have a buildPaths property', function(){
    assert.isDefined(manifest.buildPaths);
  });
  it('should have a globs property', function(){
    assert.isDefined(manifest.globs);
  });
});
