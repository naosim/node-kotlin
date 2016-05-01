node-kotlin
---
A wrapper around the kotlin compiler. Is now configured to use kotlin2js, and future releases will add functionality for general usage of the compiler.


Usage:
```javascript
var kotlin = require("node-kotlin");

kotlin({
  src: "src/**/*.kt" || ["src/**/*.kt", "gen-src/**/*.kt"],
  libraries: [
    "lib/*.zip"
  ],
  out: "out", // default: "out"
  exportKotlinJs: true, // default: false
  moduleName: "myApp", // default: "app"
  sourceMaps: true, // default: false
  verbose: true, // default: false
  metaInfo: false // default: true
});
```

Licence: MIT
