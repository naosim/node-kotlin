const
  kotlin = require(".."),
  assert = require("chai").assert,
  rimraf = require("rimraf"),
  fs = require("fs");

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

var assertPathExists = function (path, shouldExist) {
  assert.equal(
    shouldExist,
    exists(path),
    `${path} should ${shouldExist ? '' : 'not '}exist`
  );
};
describe("node-kotlin", () => {
  beforeEach(done => rimraf("out/test", {}, done));
  // afterEach(done => rimraf("out/test", {}, done));

  it("should compile file", (done) => {
    kotlin({src: "test/resources/main.kt", out: "out/test"})
      .then(()=> {
        assertPathExists("out/test/app.js", true);
        done()
      })
      .catch(done)
  });

  describe("kotlin.js", () => {
    it("should export kotlin.js if configured", (done) => {
      kotlin({
        src: "test/resources/main.kt",
        out: "out/test",
        exportKotlinJs: true
      })
        .then(()=> {
          assertPathExists("out/test/kotlin.js", true);
          done()
        })
        .catch(done)
    })
  });

  describe("sourceMaps", () => {
    it("should not generate by default", (done) => {
      kotlin({src: "test/resources/main.kt", out: "out/test"})
        .then(()=> {
          assertPathExists("out/test/app.js.map", false);
          done()
        })
        .catch(done)
    });

    it("should generate when option is set", (done) => {
      kotlin({
        src: "test/resources/main.kt",
        out: "out/test",
        sourceMaps: true
      })
        .then(()=> {
          assertPathExists("out/test/app.js.map", true);
          done()
        })
        .catch(done)
    });
  });

  describe("metaInfo", () => {
    it("should generate by default", (done) => {
      kotlin({src: "test/resources/main.kt", out: "out/test"})
        .then(()=> {
          assertPathExists("out/test/app.meta.js", true);
          done()
        })
        .catch(done)
    });

    it("should not generate when option is set to false", (done) => {
      kotlin({
        src: "test/resources/main.kt",
        out: "out/test",
        metaInfo: false
      })
        .then(()=> {
          assertPathExists("out/test/app.meta.js", false);
          done()
        })
        .catch(done)
    });
  });

  describe("libraries", () => {
    it("should be built and used as dependency", (done) => {
      kotlin({
        src: "test/resources/with-dep/library.kt",
        out: "out/test/library",
        moduleName: "library"
      })
        .then(() => kotlin({
          src: "test/resources/with-dep/client.kt",
          libraries: [
            "out/test/library/library.zip"
          ],
          out: "out/test/client",
          moduleName: "client"
        }))
        .then(() => {
          assertPathExists("out/test/library/library.js", true);
          assertPathExists("out/test/library/library.meta.js", true);
          assertPathExists("out/test/library/library.zip", true);
          assertPathExists("out/test/client/client.js", true);
          assertPathExists("out/test/client/library.js", true);
          assertPathExists("out/test/client/client.meta.js", true);
          assertPathExists("out/test/client/client.zip", true);
        })
        .then(done)
        .catch(done)

    }).timeout(5000);
  });

});
