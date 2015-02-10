Example Usage
=============

asset-builder works great with [gulp][]. But it can be used in pretty much any application where you need to combine a bunch of asset globs.

## Simple Usage With gulp

![simple workflow](images/example1-simple.png)

### Regular

```js
gulp.src([
  'bower_components/jquery/jquery.js',
  'bower_components/bootstrap/component.js',
  'assets/scripts/main.js'
])
  .pipe(concat('app.js'))
  .pipe(minify())
  .pipe(gulp.dest('dist'));
```

### asset-builder

#### `assets/manifest.json`

```json
{
  "dependencies": {
    "app.js": {
      "files": ["scripts/main.js"],
      "main": true
    },
  },
  "paths": {
    "source": "assets/",
    "dist": "dist/"
  }
}
```

#### `gulpfile.js`

```js
var manifest = require('asset-builder')('./assets/manifest.json');

var app = manifest.getDependencyByName('app.js');

gulp.src(app.globs)
  .pipe(concat(app.name))
  .pipe(minify())
  .pipe(gulp.dest(manifest.paths.dist));
```

### Benefits

- **Reuse your gulpfile, change the manifest.** Using asset-builder all the project specific configuration is done in the manifest JSON file. That way you can reuse gulpfiles across common projects or project modules.
- **Build configuration externalized.** Change your build directory structure in one place.
- **Use bower.json to control bower packages.** Do not manually manage your dependency graph

## Advanced Usage With gulp

Suppose you have a website with the following structure:

- 20 regular pages that use basic jQuery and bootstrap for things like tabs and menus.
- 1 "graphing" page where d3 and nvd3 is used to build some really nice graphs and charts.

The 20 regular pages have nothing to do with graphing. So on those pages d3 and nvd3 are unused dependencies. You run some benchmarks and you conclude that by excluding d3 and nvd3 from your 20 regular pages, you will net a significant performance increase.

![advanced usage](images/example2-js.png)

### Regular

```js
gulp.task('js:main', function () {
  return gulp.src([
    'bower_components/jquery/jquery.js',
    'bower_components/bootstrap/component.js',
    'assets/scripts/main.js'
  ])
    .pipe(concat('app.js'))
    .pipe(minify())
    .pipe(gulp.dest('dist'));
});


gulp.task('js:graph', function () {
  return gulp.src([
    'bower_components/d3/d3.js',
    'bower_components/nvd3/nvd3.js',
    'assets/scripts/graphs.js'
  ])
    .pipe(concat('graph-page.js'))
    .pipe(minify())
    .pipe(gulp.dest('dist'));
});

gulp.task('js', ['js:main', 'js:graph']);
// eww
```

### asset-builder

```json
{
  "dependencies": {
    "app.js": {
      "files": ["scripts/main.js"],
      "main": true
    },
    "graph-page.js": {
      "files": ["scripts/graphs.js"],
      "bower": ["d3", "nvd3"]
    }
  },
  "paths": {
    "source": "assets/",
    "dist": "dist/"
  }
}
```

```js
var manifest = require('asset-builder')('./assets/manifest.json');

gulp.task('js', function() {
  var merge = require('merge-stream');
  manifest.forEachDependency('js', function(dep) {
    merge.add(
      gulp.src(dep.globs, {base: 'scripts'})
        .pipe(concat(dep.name))
        .pipe(minify())
    );
  });
  return merge
    .pipe(gulp.dest('dist'));
});
```

### Benefits

- **Separate build input from build process** The declarative manifest format makes build output easier to discern.
- **All grouped asset types use the same pipeline.** Increases build consistency and maintainability.

[gulp]: http://gulpjs.com/
