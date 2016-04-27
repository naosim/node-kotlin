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

const compile = function (settings, files, compileTask) {
  const execArguments = [];
  if (isWin) {
    execArguments.push(`${__dirname}\\kotlinc\\bin\\kotlinc-js.bat`);
  } else {
    execArguments.push(`. ${__dirname}/kotlinc/bin/kotlinc-js`);
  }
  execArguments.push("-output " + settings.outDir + "/app.js");
  if (settings.metaInfo) execArguments.push("-meta-info");
  if (settings.sourceMaps) execArguments.push("-source-map");
  if (settings.verbose) execArguments.push("-verbose");
  execArguments.push(files.join(" "));

  exec(
    execArguments.join(" "),
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
  const settings = {
    src: Array.isArray(options.src) ? options.src : [options.src],
    outDir: options.out || "out",
    sourceMaps: options.sourceMaps || false,
    verbose: options.verbose || false,
    metaInfo: options.metaInfo == undefined ? true : options.metaInfo
  };

  const compileTask = q.defer();
  resolveFilenames(settings.src)
    .then(files=> compile(settings, files, compileTask));
  return compileTask.promise;
};

module.exports = (options) => kotlin(options);
