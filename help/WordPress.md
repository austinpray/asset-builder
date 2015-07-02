asset-builder for WordPress Projects
====================================

asset-builder was originally created to service the [Sage
8](https://github.com/roots/sage/releases/tag/8.0.0) asset pipeline. Why create
asset-builder instead of using [webpack][] or [browserify][]? Let's think about
the requirements for an asset orchestration tool for WordPress developers:

- Wide gamut of JavaScript and front-end skill in general.
- Needs to be compatible with legacy libraries and repository maintainers who
    [will not cooperate][no coop]. The asset-pipeline should emulate old style
    of sequentially including JavaScript dependencies one by one as script tags
    in your templates.
- Needs to support [bower][]. [bower][] simply has the packages WordPress
    developers need to do their job. [npm][] requires work on the behalf of the
    package maintainer to have a module published and updated. As long as a repo
    is hosted on GitHub it is available to be consumed by [bower][].
- Do not force people to do anything. Allow people to do things the old way and
    then build enhancements on-top of that. People can opt-in to timesavers like
    using [bower][], but are not required to.
- Needs to be able to include dependencies from outside the project. WordPress
    plugins, parent themes, etc. all have their own assets that can be built
    and included into your asset-pipeline.

## Goal of this Document

If you need something production ready, immediately: [use Sage][sage]. It's
already got everything built out, configured, and good to go. It's also
well-maintained, so you get updates for free! The goal of this document is to
walk through the thought process behind [Sage's][sage] setup.

## Directory Setup


```
.
├── 404.php
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE.md
├── README.md
├── assets
│   ├── fonts
│   ├── images
│   ├── manifest.json
│   ├── scripts
│   │   └── main.js
│   └── styles
│       ├── common
│       │   ├── _global.scss
│       │   └── _variables.scss
│       ├── components
│       │   ├── _buttons.scss
│       │   ├── _comments.scss
│       │   ├── _forms.scss
│       │   ├── _grid.scss
│       │   └── _wp-classes.scss
│       ├── editor-style.scss
│       ├── layouts
│       │   ├── _footer.scss
│       │   ├── _header.scss
│       │   ├── _pages.scss
│       │   ├── _posts.scss
│       │   └── _sidebar.scss
│       └── main.scss
├── base.php
├── bower.json
├── functions.php
├── gulpfile.js
├── index.php
├── lang
│   └── sage.pot
├── lib
│   ├── assets.php
│   ├── conditional-tag-check.php
│   ├── config.php
│   ├── extras.php
│   ├── init.php
│   ├── titles.php
│   ├── utils.php
│   └── wrapper.php
├── package.json
├── page.php
├── ruleset.xml
├── screenshot.png
├── search.php
├── single.php
├── style.css
├── template-custom.php
└── templates
    ├── comments.php
    ├── content-page.php
    ├── content-search.php
    ├── content-single.php
    ├── content.php
    ├── entry-meta.php
    ├── footer.php
    ├── head.php
    ├── header.php
    ├── page-header.php
    ├── searchform.php
    └── sidebar.php

11 directories, 55 files
```

[bower]: http://bower.io/
[browserify]: http://browserify.org/
[no coop]: https://github.com/keithclark/selectivizr/issues/84#issuecomment-117575192
[npm]: http://npmjs.org/
[sage]: https://github.com/roots/sage
[webpack]: https://webpack.github.io/
