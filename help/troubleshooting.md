# Troubleshooting asset-builder

## bower

### Some bower packages not being injected?

>I have had a bit of trouble with the wiredep / bower setup as it will bring in some of my "dependencies": but not all of them.

Solution: https://github.com/roots/roots/issues/1313#issuecomment-73735184

Some bower packages do not have the correct metadata. To be automatically injected a bower package needs the "main" property defined in its bower.json. You can either

- Pull request the repo and add the correct metadata.
- Use the [unofficial "overrides" option](https://github.com/ck86/main-bower-files#overrides-options) in bower.json
```js
{
    "overrides": {
        "BOWER-PACKAGE": {
            "main": ['js/file.js']
        }
    }
}
```
