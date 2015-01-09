/* jshint node: true */
/* global describe, it, beforeEach */
'use strict';
var chai            = require('chai');
var assert          = chai.assert;
var fs              = require('fs');
var m               = require('../lib/index');
var readManifest    = require('../lib/readManifest');
var processManifest = require('../lib/processManifest');
var buildGlobs      = require('../lib/buildGlobs');
var Dependency      = require('../lib/Dependency');
var bower           = require('bower');
var Q               = require('q');
var mkdirp          = require('mkdirp');

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

describe('JSON Reading and Parsing', function(){
  it('should throw an error if the manifest cannot be found', function(){
    assert.throws(function() { readManifest('totally/bogus/file.json'); }, Error);
  });
  it('should throw an error if the manifest is not valid JSON', function(){
    assert.throws(function () { readManifest('test/fixtures/invalid.json'); }, SyntaxError);
  });
  it('should return an object if JSON is valid', function(){
    assert.isObject(readManifest('test/fixtures/manifest-v1.json'));
  });
});

describe('Processing the Manifest', function(){
  var manifest;
  it('should throw an error if the json file is missing the "dependencies" property', function () {
    assert.throws(function () {
      manifest = processManifest(readManifest('test/fixtures/manifest-missing.json'));
    }, Error, 'Manifest File Error: missing');
  });
  it('should throw an error if the json file is not a plain object', function () {
    assert.throws(function () {
      manifest = processManifest([ { 'lol': 'not valid' } ]);
    }, Error, 'Manifest File Error: file seems');
  });
  it('should turn all "files" strings into arrays', function(){
    manifest = processManifest(readManifest('test/fixtures/manifest-mixed.json'));
    assert.isArray(manifest.dependencies['app.css'].files);
    assert.isArray(manifest.dependencies['home.js'].files);
  });
  it('should append the source dir to all files arrays except external', function () {
    manifest = processManifest(readManifest('test/fixtures/manifest-v1.json'));
    assert.equal(manifest.dependencies['app.css'].files[0], 'assets/styles/main.less');
    assert.equal(manifest.dependencies['noappend.js'].files[0], '../themedir/home.js');
  });
});

describe('Dependency', function () {
  var dep = new Dependency('app.js', {
    vendor: ['test.js'],
    files: ['test1.js']
  });
  var depBare = new Dependency('app.css', {
  });
  it('should set properties correctly', function () {
    assert.equal(dep.type, 'js');
    assert.equal(depBare.type, 'css');
    assert.sameMembers(dep.globs, [
      'test.js',
      'test1.js'
    ]);
    assert.sameMembers(depBare.globs, []);
  });
  it('should prependGlobs correctly', function () {
    dep.prependGlobs('new.js');
    assert.sameMembers(dep.globs, [
      'new.js',
      'test.js',
      'test1.js'
    ]);
  });
});

describe('Glob building', function () {
  var manifest;
  var mockBowerFiles = require('./fixtures/sampleMainBowerFiles.json').files;
  var globInstance = new buildGlobs(manifest, mockBowerFiles);
  describe('filtering by package', function () {
    it('should get particular package files by string', function () {
      var jq = buildGlobs.prototype.filterByPackage(mockBowerFiles, 'jquery');
      assert.isArray(jq);
      assert.sameMembers(jq, [
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/jquery/dist/jquery.js",
      ]);
    });
    it('should get particular package files by array', function () {
      var jq = buildGlobs.prototype.filterByPackage(mockBowerFiles, ['jquery']);
      assert.isArray(jq);
      assert.sameMembers(jq, [
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/jquery/dist/jquery.js",
      ]);
    });
  });

  describe('rejecting by package', function () {
    it('should return everything except specified packages', function () {
      var rejected = buildGlobs.prototype.rejectByPackage([
        '/bogus/bower_components/jquery/main.js',
        '/bogus/bower_components/mootools/main.js'
      ], ['jquery']);
      assert.sameMembers(rejected, [
        '/bogus/bower_components/mootools/main.js'
      ]);
    });
  });

  describe('filtering by type', function () {
    it('should get fonts', function () {
      assert.sameMembers(globInstance.filterByType(mockBowerFiles, 'fonts'), [
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/fonts/glyphicons-halflings-regular.eot",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/fonts/glyphicons-halflings-regular.svg",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/fonts/glyphicons-halflings-regular.ttf",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/fonts/glyphicons-halflings-regular.woff"
      ]);
    });
    it('should get javascript', function () {
      assert.sameMembers(globInstance.filterByType(mockBowerFiles, 'js'), [
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/jquery/dist/jquery.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/transition.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/alert.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/button.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/carousel.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/collapse.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/dropdown.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/modal.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/tooltip.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/popover.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/scrollspy.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/tab.js",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/affix.js",
      ]);
    });
    it('should get css', function () {
      assert.sameMembers(globInstance.filterByType(mockBowerFiles, 'css'), [
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/less/bootstrap.less",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/bogus/file.scss",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/bogus/file.sass",
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/bogus/file.css",
      ]);
    });
  });

  describe('build a list of Dependency objects', function () {
    it('should get js files', function () {
    });
  });

  describe('output globs', function () {
    var dependencies = {
      "app.js": {
        files: ['path/to/script.js']
      },
      fonts: {
        files: ['font/path/*']
      },
      images: {
        files: ['image/path/*']
      }
    };
    var bower = [
      '/lol/fonts/test.woff'
    ];
    it('should output a fonts glob', function () {
      assert.sameMembers(new buildGlobs(dependencies, bower).globs.fonts, [
        'font/path/*',
        '/lol/fonts/test.woff'
      ]);
    });
    it('should output an images glob', function () {
      assert.sameMembers(new buildGlobs(dependencies, bower).globs.images, [
        'image/path/*'
      ]);
    });
    it('should output a bower glob', function () {
      assert.sameMembers(new buildGlobs(dependencies, bower).globs.bower, bower);
    });
  });

  describe('excluded bower dependencies from main', function () {
  });

  describe('getting output files', function () {
    var mockBower = [
      "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/jquery/dist/jquery.js",
      "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/transition.js",
      "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/alert.js",
    ];
    it('should add bower deps to the main dependency', function () {
      var expected = [
        {
          type: 'js',
          name: 'app.js',
          globs: [].concat(mockBower, ['path/to/script.js'])
        }
      ];
      var actual = buildGlobs.prototype.getOutputFiles('js', {
        "app.js": {
          files: ['path/to/script.js'],
          main: true
        }
      },
      mockBower);
      assert.sameMembers(actual[0].globs, expected[0].globs);
    });
    it('should add everything except jquery if defined elsewhere', function () {
      var expected = [
        {
          type: 'js',
          name: 'app.js',
          globs: [
            "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/transition.js",
            "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/js/alert.js",
            "path/to/script.js"
          ]
        },
        {
          type: 'js',
          name: 'jquery.js',
          globs: [
            "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/jquery/dist/jquery.js",
          ]
        }
      ];
      var actual = buildGlobs.prototype.getOutputFiles('js', {
        "app.js": {
          files: ['path/to/script.js'],
          main: true
        },
        "jquery.js": {
          bower: ['jquery']
        }
      },
      mockBower);
      assert.sameMembers(actual[0].globs, expected[0].globs, 'app.js not the same');
      assert.sameMembers(actual[1].globs, expected[1].globs, 'jquery not the same');
    });
  });
});

describe('Integration Tests', function () {
  describe('Bower', function () {
    beforeEach(function(done) {
      this.timeout(30e3);
      mkdirp('test/tmp', function () {
        bowerSetup().then(function () {
          done();
        });
      });
    });

    it('should return success', function () {
      m('test/fixtures/manifest-v1.json', {
        paths: {
          bowerDirectory: 'test/tmp/bower_components',
          bowerJson: 'test/tmp/bower.json'
        }
      });
    });
  });
});
