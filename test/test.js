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
var _               = require('lodash');

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
  it('should parse the type correctly', function () {
    assert.equal(Dependency.parseType('app.css'), 'css');
    assert.equal(Dependency.parseType('app.js'), 'js');
    assert.equal(Dependency.parseType('app.min.1.11.1.js'), 'js');
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
        "/Users/austinpray/DEV/opensauce/asset-builder/test/tmp/bower_components/bootstrap/bogus/file.css"
      ]);
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
    it('should build a list of bower packages to exclude', function () {
      var deps = {
        "random.js": {
          bower: ['jquery']
        },
        "other.js": {
          bower: ['bootstrap', 'bogus']
        }
      };
      var exclude = buildGlobs.prototype.bowerExclude(deps);
      assert.sameMembers(exclude, [
        'jquery',
        'bootstrap',
        'bogus'
      ]);
    });
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
  describe('manifests', function () {
    beforeEach(function(done) {
      this.timeout(30e3);
      mkdirp('test/tmp', function () {
        bowerSetup().then(function () {
          done();
        });
      });
    });

    describe('roots manifest', function () {
      it('default roots manifest', function () {
        var output = m('test/fixtures/roots.json', {
          paths: {
            bowerDirectory: 'test/tmp/bower_components',
            bowerJson: 'test/tmp/bower.json'
          }
        });

        assert.lengthOf(output.globs.js, 3);
        assert.lengthOf(output.globs.css, 1);

        // app.css
        assert.equal(output.globs.css[0].type, 'css');
        assert.equal(output.globs.css[0].name, 'app.css');
        assert.lengthOf(output.globs.css[0].globs, 1);
        assert.include(output.globs.css[0].globs[0], 'main.less');

        // app.js
        assert.equal(output.globs.js[0].type, 'js');
        assert.equal(output.globs.js[0].name, 'app.js');
        assert.include(output.globs.js[0].globs, 'assets/scripts/**/*');
        _.forEach(output.globs.js[0].globs, function (s) {
          assert.notInclude(s, 'jquery');
          assert.notInclude(s, 'modernizr');
        });

        // jquery.js
        assert.equal(output.globs.js[1].type, 'js');
        assert.equal(output.globs.js[1].name, 'jquery.js');
        assert.lengthOf(output.globs.js[1].globs, 1);
        assert.include(output.globs.js[1].globs[0], 'jquery.js');

        // modernizr.js
        assert.equal(output.globs.js[2].type, 'js');
        assert.equal(output.globs.js[2].name, 'modernizr.js');
        assert.lengthOf(output.globs.js[2].globs, 1);
        assert.include(output.globs.js[2].globs[0], 'modernizr.js');

        // has images
        assert.sameMembers(output.globs.images, [
          'assets/images/**/*'
        ]);
      });
    });


    describe('extremely verbose manifest', function () {
      it('extremely verbose manifest', function () {
        var output = m('test/fixtures/verbose.json', {
          paths: {
            bowerDirectory: 'test/tmp/bower_components',
            bowerJson: 'test/tmp/bower.json'
          }
        });

        var globs = output.globs;

        assert.sameMembers(_.find(globs.js, { name: 'external.js' }).globs, [
          '../../noappend.js'
        ]);

        assert.sameMembers(_.find(globs.js, { name: 'vendor.js' }).globs, [
          '../../plugin/script.js',
          'assets/scripts/somescript.js'
        ]);

      });
    });
  });
});

describe('convenience methods', function () {
  describe('getProjectGlobs', function () {
    it('should return project JS', function () {
      var proj = m.Manifest.prototype.getProjectGlobs.call({
        dependencies: {
          "app.js": {
            files: [
              "app.js",
              "script.js"
            ]
          },
          "cool.js": {
            files: [
              "cool1.js",
              "cool2.js"
            ]
          }
        }
      });
      assert.isArray(proj.js);
      assert.sameMembers(proj.js, [
        'app.js',
        'script.js',
        "cool1.js",
        "cool2.js"
      ]);
    });
    it('should return project CSS', function () {
      var proj = m.Manifest.prototype.getProjectGlobs.call({
        dependencies: {
          "app.css": {
            files: [
              "app.less",
              "styles.scss"
            ]
          }
        }
      });
      assert.sameMembers(proj.css, [
        "app.less",
        "styles.scss"
      ]);
    });
  });
  describe('foreach dep', function () {
    it('should loop through the dependencies', function () {
      var count = 0;
      m.Manifest.prototype.forEachDependency.call({
        globs: {
          js: [
            {
              type: 'js',
              name: 'script.js',
              globs: [
                'class.js',
                'important.js'
              ]
            },
            {
              type: 'js',
              name: 'test.js',
              globs: [
                'class.js',
                'important.js'
              ]
            }
          ]
        }
      }, 'js', function (value) {
        count += 1;
        assert.equal(value.type, 'js');
        assert.sameMembers(value.globs, [
          'class.js',
          'important.js'
        ]);
      });
      assert.equal(count, 2);
    });
  });
});
