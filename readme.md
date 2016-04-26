node-kotlin
---
A wrapper around the kotlin compiler. Is now configured to use kotlin2js, and future releases will add functionality for general usage of the compiler.


Usage:
```javascript
var kotlin = require("node-kotlin");

kotlin({
  src: "src/**/*.kt",
  out: "out"
});
```

Licence: MIT
