asset-builder Manifest Spec 1.0
=============

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC2119][].

## JSON Serialization

### Examples

Following is a simple, minimal example of a `manifest.json`:

```json
{
  "dependencies": {
    "app.js": {
      "files": [
        "scripts/**/*",
        "scripts/main.js"
      ],
      "main": true
    },
    "main.css": {
      "files": [
        "styles/main.less"
      ],
      "main": true
    },
    "modernizr.js": {
      "bower": ["modernizr"]
    }
  }
}
```

A more extensive `manifest.json` follows. 

```json
{
  "dependencies": {
    "app.js": {
      "files": [
        "scripts/services/**/*.js",
        "scripts/controllers/**/*.js",
        "scripts/directives/**/*.js",
        "scripts/main.js"
      ],
      "vendor": [
        "../../plugins/example-plugin/assets/plugin.js"
      ],
      "main": true
    },
    "main.css": {
      "files": "styles/main.less",
      "vendor": [
        "../../plugins/example-plugin/assets/style.css"
      ],
      "main": true
    },
    "homepage.js": {
      "files": [
        "custom-dir/homepage.js"
      ],
      "external": true,
      "bower": ["slick-carousel"]
    },
    "jquery.js": {
      "bower": ["jquery"]
    },
    "modernizr.js": {
      "bower": ["modernizr"]
    },
    "fonts": {
      "files": ["fonts/**/*"]
    },
    "images": {
      "files": ["images/**/*"]
    }
  },
  "paths": {
    "source": "assets/",
    "dist": "build/"
  },
  "config": {
    "devUrl": "example.dev"
  }
}
```

- In addition to containing a more dependencies, the example contains optional properties such as `paths`. 
- The directory where the compiled files are output has been changed to `build/`. 
- The `app.js` dependency is pulling in a vendor file from a directory outside the project directory. 
- The `homepage.js` dependency has specified an `external` as `true`. This means it will expect to find `custom-dir/homepage.js` and not `assets/custom-dir/homepage.js`. 
- `homepage.js` has also specified that it requires `slick-carousel` as a bower dependency. In this case `slick-carousel` will be excluded from being automatically included in `app.js` and will be included in `homepage.js`. 
- `main.css` in this case only has one file, so its `files` property can optionally be defined as a string. 
- A `fonts` and `images` dependency has been specified: if you do not include these properties explicitly they will be automatically added for you.

### Defaults

```json
{
  "dependencies": {
    "fonts": {
      "files": {
        "files": ["fonts/**/*"]
      },
      "images": {
        "files": ["images/**/*"]
      }
  },
  "paths": {
    "source": "assets/",
    "dist": "dist/"
  }
}
```

### `manifest.json` Serialization

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>dependencies</td>
      <td><a href="#serialization-dependencies">Dependencies</a></td>
      <td>Defines project’s output files by listing the inputs as <a href="#serialization-dependency">Dependency</a> objects. A manifest MUST contain a "dependencies" property.</td>
    </tr>
    <tr>
      <td>paths</td>
      <td><a href="#serialization-paths">Paths</a></td>
      <td>Defines a project’s input and output locations. A manifest MAY contain a "paths" property.</td>
    </tr>
    <tr>
      <td>config</td>
      <td>JSON [RFC4627] Object</td>
      <td>An object containing arbitrary configuration values as properties. This is mainly just a convenience so you can feed static values to your build process. A manifest MAY contain a "config" property.</td>
    </tr>
  </tbody>
</table>

### Dependencies Serialization <a name="serialization-dependencies"></a>

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Value</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>{{NAME}}.js</td>
      <td><a href="#serialization-dependency">Dependency</a></td>
      <td>Defines project’s output files by listing the inputs as <a href="#serialization-dependency">Dependency</a> objects. A manifest MAY contain one or more JS Dependencies.</td>
    </tr>

    <tr>
      <td>{{NAME}}.css</td>
      <td><a href="#serialization-dependency">Dependency</a></td>
      <td>Defines project’s output files by listing the inputs as <a href="#serialization-dependency">Dependency</a> objects. A manifest MAY contain one or more CSS Dependencies.</td>
    </tr>

    <tr>
      <td>fonts</td>
      <td><a href="#serialization-dependency">Dependency</a></td>
      <td>Defines a project’s fonts. If this is not explicitly defined by the user it will be automatically defined with a files property as <code>'fonts/**/*'</code>.
      A Dependencies MAY contain a "fonts" property.</td>
    </tr>

    <tr>
      <td>images</td>
      <td><a href="#serialization-dependency">Dependency</a></td>
      <td>Defines a project’s images. If this is not explicitly defined by the user it will be automatically defined with a files property as <code>'images/**/*'</code>. A Dependencies MAY contain an "images" property.</td>
    </tr>
  </tbody>
</table>


### Dependency Serialization <a name="serialization-dependency"></a>

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Value</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>files</td>
      <td>JSON [RFC4627] Array of Strings <strong>OR</strong> String</td>
      <td>Describes a list of file paths to local project files in <a href="#footnotes-globs">glob format</a>. A Dependency MAY contain a "files" property.</td>
    </tr>
    <tr>
      <td>vendor</td>
      <td>JSON [RFC4627] Array of Strings <strong>OR</strong> String</td>
      <td>Describes a list of file paths to vendored project files in <a href="#footnotes-globs">glob format</a>. A Dependency MAY contain a "files " property.</td>
    </tr>
    <tr>
      <td>bower</td>
      <td>JSON [RFC4627] Array of Strings <strong>OR</strong> String</td>
      <td>Describes a list of bower package names to be included in that dependency. A Dependency MAY have a "bower" property.</td>
    </tr>
    <tr>
      <td>main</td>
      <td>boolean</td>
      <td>Describes whether or not all of the bower dependencies will automatically be included in this Dependency. A Dependency MAY have a "main" property.</td>
    </tr>
    <tr>
      <td>external</td>
      <td>boolean</td>
      <td>Describes whether or not the source (`path.source`) directory will be prepended to each glob in the "files" property. A Dependency MAY have an "external" property.</td>
    </tr>
  </tbody>
</table>

### Paths Serialization <a name="serialization-paths"></a>

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Value</th>
      <th>Description</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td>source</td>
      <td>JSON [RFC4627] String</td>
      <td>Describes the base location of a project’s asset folder. This will be prepended to all Dependency "file" globs unless `external: true` is specified. The "source" property MUST have a trailing slash. Paths MAY have a "source" property.</td>
    </tr>
    <tr>
      <td>dist</td>
      <td>JSON [RFC4627] String</td>
      <td>Describes the base location of a project’s target build folder. Paths MAY have a "dist" property.</td>
    </tr>
  </tbody>
</table>

# Footnotes

## See Also

### Globs <a name="footnotes-globs"></a>

* `man sh`
* `man bash` (Search for "Pattern Matching")
* `man 3 fnmatch`
* `man 5 gitignore`
* [minimatch][]

## References

\[RFC4627\] Crockford, D., “The application/json Media Type for JavaScript Object Notation (JSON),” July 2006.


[RFC2119]: https://www.ietf.org/rfc/rfc2119.txt
[RFC4627]: http://www.ietf.org/rfc/rfc4627.txt
[glob]: https://github.com/isaacs/node-glob
[minimatch]: https://github.com/isaacs/minimatch
