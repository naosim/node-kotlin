"use strict";

const
  exec = require("child_process").exec,
  glob = require("glob"),
  fs = require("fs"),
  q = require("q"),
  isWin = /^win/.test(process.platform);

const resolveFilenames = src => q.all(
  src.map(dir => {
    const resolveGlobTask = q.defer();
    glob(dir, {}, (er, files) => resolveGlobTask.resolve(files));
    return resolveGlobTask.promise;
  })
).then(flatten);

const flatten = (elementsLists) => elementsLists.reduce((aggregate, elements) =>
    elements.reduce((innerAggregate, element) => {
        innerAggregate.push(element);
        return innerAggregate;
      },
      aggregate
    ),
  []
);

const compile = function (outDir, files, compileTask) {
  exec([
      isWin ? "kotlinc\\bin\\kotlinc-js.bat" : ". ./kotlinc/bin/kotlinc-js",
      "-output " + outDir + "/app.js",
      "-meta-info",
      // "-source-map",
      files.join(" ")
    ].join(" "),
    (err, stdout, stderr) => {
      if (stdout) {
        console.log("stdout", stdout);
      }
      if (stderr) {
        console.log("stderr", stderr);
      }
      compileTask.resolve();
    }
  );
};

const kotlin = (options) => {
  const src = Array.isArray(options.src) ? options.src : [options.src];
  const outDir = options.out || "out";

  const compileTask = q.defer();
  resolveFilenames(src).then(files=> compile(outDir, files, compileTask));
  return compileTask.promise;
};

module.exports = (options) => kotlin(options);
