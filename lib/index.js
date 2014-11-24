'use strict';
var _        = require('lodash');
var mainBowerFiles = require('main-bower-files');
var obj      = require('object-path');
var p = require('path');
var traverse = require('traverse');

function getManifest(path) {
  var m = require(p.join(p.dirname(module.parent.filename), path));
  var defaults = {
    buildPaths: {
      appendSrc: ['theme'],
      src: 'assets/',
      dist: 'dist/'
    }
  };
  var err = function (msg) {
    msg = msg || 'file seems to be malformed';
    console.error('Manifest File Error: %s: %s', path, msg);
    process.exit(1);
  };
  var required = ['dependencies', 'buildPaths'];

  if(_.isPlainObject(m)) {
    m = _.defaults(m, defaults);

    _.forEach(required, function (req) {
      if(!obj.has(m, req)) {
        err('missing "'+req+'" property');
      }
    });

    traverse(m.dependencies).forEach(function (node) {
      if(this.isLeaf && !_.isArray(node) && !_.isArray(this.parent.node)) {
        this.update([node]);
      }
    });

    if(m.buildPaths.appendSrc) {
      _.forOwn(m.dependencies, function (dependency, name) {
        if(m.buildPaths.appendSrc.indexOf(name) >= 0) {
          traverse(m.dependencies[name]).forEach(function (node) {
            if(this.isLeaf) {
              this.update(m.buildPaths.src + node);
            }
          });
        }
      });
    }

    return m;
  } else {
    err();
  }
}

function buildGlobs(manifest) {
  var bower = require('wiredep')({
    exclude: obj.get(manifest, 'ignoreDependencies.bower')
  });
  return {
    scripts: (bower.js || [])
      .concat(obj.get(manifest, 'dependencies.vendor.scripts', []))
      .concat(obj.get(manifest, 'dependencies.theme.scripts', [])),
    scriptsIgnored: _.reduce(obj.get(manifest, 'ignoreDependencies.bower', []), 
      function (paths, depName) {
        return paths.concat(obj.get(bower, 'packages.'+depName+'.main', []));
      }, []),
    styles: (bower.css || [])
      .concat(obj.get(manifest, 'dependencies.vendor.styles', []))
      .concat(obj.get(manifest, 'dependencies.theme.styles', [])),
    editorStyle: obj.get(manifest, 'dependencies.theme.editorStyle', []),
    fonts: mainBowerFiles({ filter: /\.(eot|svg|ttf|woff)$/i })
      .concat(manifest.buildPaths.src + 'fonts/**/*.{eot,svg,ttf,woff}'),
    images: manifest.buildPaths.src + 'images/**/*'
  };
}

var Manifest = function (path) {
  var m = getManifest(path);
  return _.merge(m, {
    globs: buildGlobs(m)
  });
};



module.exports = Manifest;
