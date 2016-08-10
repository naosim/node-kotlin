"use strict";

const
  exec = require("child_process").exec,
  glob = require("glob"),
  fs = require("fs"),
  q = require("q"),
  AdmZip = require("adm-zip"),
  mkdirp = require('mkdirp'),
  isWin = /^win/.test(process.platform);

const exists = path => {
  try {
    fs.accessSync(path, fs.F_OK | fs.W_OK, (err) => {
      console.log(err ? 'no access!' : 'can read/write');
    });
    return true;
  } catch (e) {
    return false;
  }
};

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

const getOutputFilePath = (settings) => getFilePath(
  settings.outDir,
  settings.moduleName,
  ".js"
);
const getOutputMetaFilePath = (settings) => getFilePath(
  settings.outDir,
  settings.moduleName,
  ".meta.js"
);
const getFilePath = (dir, file, ext) => `${dir}/${file}${ext}`;

const copyLibraryFilesToOutput = (libraryFiles,
                                  settings) => libraryFiles
  .map(file => new AdmZip(file))
  .forEach(zip => zip.extractAllTo(settings.outDir));

const compile = (settings,
                 sourceFiles,
                 libraryFiles) => {
  const task = q.defer();

  try {
    mkdirp(settings.outDir);

    const execArguments = [];
    if (isWin) {
      execArguments.push(`${__dirname}\\kotlinc\\bin\\kotlinc-js.bat`);
    } else {
      execArguments.push(`. ${__dirname}/kotlinc/bin/kotlinc-js`);
    }

    console.log(`Processing ${libraryFiles.length} library files`);
    if (libraryFiles.length > 0) {
      libraryFiles.forEach(file => console.log(`Found library: ${file}`));
      execArguments.push("-library-files");
      execArguments.push(libraryFiles.join(","));
      copyLibraryFilesToOutput(libraryFiles, settings);
    }

    const outputFilePath = getOutputFilePath(settings);
    console.log(`Setting output path: ${outputFilePath}`);
    execArguments.push("-output " + outputFilePath);

    if (settings.metaInfo) execArguments.push("-meta-info");
    if (settings.sourceMaps) execArguments.push("-source-map");
    if (settings.verbose) execArguments.push("-verbose");
    execArguments.push(sourceFiles.join(" "));

    const execArgumentsJoined = execArguments.join(" ");
    console.log(`Compiling with: ${execArgumentsJoined}`)
    exec(
      execArgumentsJoined,
      (err, stdout, stderr) => {
        if (stdout) {
          console.log(`${stdout}`);
        }
        if (stderr) {
          console.error(stderr);
        }

        if (settings.exportKotlinJs) {
          exportKotlinJs(settings)
        }
        if (settings.exportZip) {
          generateOutputZip(settings, task.resolve);
        } else task.resolve();
      }
    );
  } catch (e) {
    task.reject(e);
  }

  return task.promise;
};

const exportKotlinJs = (settings) => {
  const zip = new AdmZip(`${__dirname}/kotlinc/lib/kotlin-jslib.jar`);
  const entry = zip.getEntries().find(entry => entry.entryName === "kotlin.js");

  fs.writeFileSync(
    `${settings.outDir}/kotlin.js`,
    zip.readFile(entry)
  );
};

const generateOutputZip = (settings, done) => {
  var zip = new AdmZip();

  return resolveFilenames([settings.outDir + "/*.*"])
    .then(files => {
      files.map(path => {
        const name = path.split("/").pop();
        console.log(`Adding file(${name}) to zip: ${path}`);

        zip.addFile(
          name,
          fs.readFileSync(path),
          '',
          0o0644 << 16
        )
      });
    })
    .then(() => {
      const path = `${settings.outDir}/${settings.moduleName}.zip`;
      console.log(`Writing zip: ${path}`)
      zip.writeZip(path, done);
    });
};

const kotlin = (options) => {
  const settings = {
    src: Array.isArray(options.src) ? options.src : [options.src],
    libraries: Array.isArray(options.libraries) ? options.libraries : [],
    outDir: options.out || "out",
    exportKotlinJs: options.hasOwnProperty("exportKotlinJs") ? options.exportKotlinJs : false,
    exportZip: options.hasOwnProperty("exportZip") ? options.exportZip : true,
    moduleName: options.moduleName || "app",
    sourceMaps: options.sourceMaps || false,
    verbose: options.verbose || false,
    metaInfo: options.metaInfo == undefined ? true : options.metaInfo
  };

  return q.all([
    resolveFilenames(settings.src),
    resolveFilenames(settings.libraries)
  ]).spread((sourceFiles, libraryFiles) => compile(
    settings,
    sourceFiles,
    libraryFiles
  ))
};

module.exports = (options) => kotlin(options);
